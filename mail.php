<?php

declare(strict_types=1);

function redirect_with_status(string $status): never
{
    header('Location: contact.html?status=' . rawurlencode($status));
    exit;
}

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }
    return $value;
}

function smtp_write($socket, string $data): void
{
    fwrite($socket, $data . "\r\n");
}

function smtp_read($socket): string
{
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }
    return trim($response);
}

function smtp_expect($socket, array $codes): string
{
    $response = smtp_read($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP error: ' . $response);
    }
    return $response;
}

function smtp_send_mail(
    string $host,
    int $port,
    string $encryption,
    string $username,
    string $password,
    string $fromEmail,
    string $fromName,
    string $toEmail,
    string $subject,
    string $body,
    ?string $replyTo
): void {
    $remote = ($encryption === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
    $socket = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        throw new RuntimeException('Unable to connect to SMTP server: ' . $errstr);
    }

    stream_set_timeout($socket, 20);

    smtp_expect($socket, [220]);

    $localHost = preg_replace('/[^a-zA-Z0-9.-]/', '', ($_SERVER['HTTP_HOST'] ?? 'localhost')) ?: 'localhost';
    smtp_write($socket, 'EHLO ' . $localHost);
    smtp_expect($socket, [250]);

    if ($encryption === 'starttls') {
        smtp_write($socket, 'STARTTLS');
        smtp_expect($socket, [220]);

        $cryptoOk = stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        if ($cryptoOk !== true) {
            throw new RuntimeException('Failed to enable TLS encryption.');
        }

        smtp_write($socket, 'EHLO ' . $localHost);
        smtp_expect($socket, [250]);
    }

    if ($username !== '' && $password !== '') {
        smtp_write($socket, 'AUTH LOGIN');
        smtp_expect($socket, [334]);

        smtp_write($socket, base64_encode($username));
        smtp_expect($socket, [334]);

        smtp_write($socket, base64_encode($password));
        smtp_expect($socket, [235]);
    }

    smtp_write($socket, 'MAIL FROM:<' . $fromEmail . '>');
    smtp_expect($socket, [250]);

    smtp_write($socket, 'RCPT TO:<' . $toEmail . '>');
    smtp_expect($socket, [250, 251]);

    smtp_write($socket, 'DATA');
    smtp_expect($socket, [354]);

    $safeFromName = str_replace(["\r", "\n"], '', $fromName);
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . $safeFromName . ' <' . $fromEmail . '>',
    ];

    if ($replyTo !== null && $replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    $data = 'Subject: ' . str_replace(["\r", "\n"], '', $subject) . "\r\n";
    $data .= implode("\r\n", $headers) . "\r\n\r\n";
    $data .= str_replace(["\r\n", "\r", "\n"], "\r\n", $body) . "\r\n.\r\n";

    fwrite($socket, $data);
    smtp_expect($socket, [250]);

    smtp_write($socket, 'QUIT');
    fclose($socket);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('method');
}

if (!empty($_POST['website'] ?? '')) {
    redirect_with_status('spam');
}

$name = trim((string)($_POST['con_name'] ?? ''));
$email = trim((string)($_POST['con_email'] ?? ''));
$subject = trim((string)($_POST['con_subject'] ?? ''));
$message = trim((string)($_POST['con_message'] ?? ''));

if ($name === '' || $message === '') {
    redirect_with_status('invalid');
}

if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    redirect_with_status('invalid');
}

$to = env('CONTACT_TO_EMAIL', 'paralkarnikita@gmail.com');
$smtpHost = env('SMTP_HOST', 'smtp.gmail.com');
$smtpPort = (int)env('SMTP_PORT', '587');
$smtpEncryption = strtolower((string)env('SMTP_ENCRYPTION', 'starttls')); // starttls | ssl | none
$smtpUser = (string)env('SMTP_USERNAME', '');
$smtpPass = (string)env('SMTP_PASSWORD', '');
$fromEmail = (string)env('SMTP_FROM_EMAIL', $smtpUser);
$fromName = (string)env('SMTP_FROM_NAME', 'Portfolio Contact');


if ($to === null || $to === '' || $fromEmail === '') {
    // Fallback: try PHP mail() with default values for local testing
    $to = 'paralkarnikita@gmail.com';
    $fromEmail = 'noreply@localhost';
    $fromName = 'Portfolio Contact';
}

$safeName = preg_replace('/[\r\n]+/', ' ', $name) ?: 'Unknown';
$safeSubject = preg_replace('/[\r\n]+/', ' ', $subject) ?: 'Portfolio Contact Form';

$body = implode(PHP_EOL, [
    'New message from portfolio contact form',
    '-------------------------------------',
    'Name: ' . $safeName,
    'Email: ' . ($email !== '' ? $email : 'Not provided'),
    'Subject: ' . $safeSubject,
    '',
    'Message:',
    $message,
    '',
    '-------------------------------------',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'),
    'User Agent: ' . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'),
    'Time: ' . date('c'),
]);

if ($smtpUser && $smtpPass) {
    // Use SMTP if credentials are set
    try {
        smtp_send_mail(
            $smtpHost,
            $smtpPort,
            $smtpEncryption,
            $smtpUser,
            $smtpPass,
            $fromEmail,
            $fromName,
            $to,
            $safeSubject,
            $body,
            $email !== '' ? $email : null
        );
        redirect_with_status('success');
    } catch (Throwable $e) {
        error_log('Contact form SMTP send failed: ' . $e->getMessage());
        // fallback to mail()
    }
}

$headers = [
    'From: ' . $fromName . ' <' . $fromEmail . '>',
    'Reply-To: ' . ($email !== '' ? $email : $fromEmail),
    'Content-Type: text/plain; charset=UTF-8',
];
$mailSent = mail($to, $safeSubject, $body, implode("\r\n", $headers));
if ($mailSent) {
    redirect_with_status('success');
} else {
    error_log('Contact form PHP mail() failed.');
    redirect_with_status('failed');
}
