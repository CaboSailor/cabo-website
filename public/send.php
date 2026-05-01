<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Honeypot: bots fill hidden fields. Pretend success.
if (!empty($_POST['website']) || !empty($_POST['url'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// Rate limit: one submission / 30s per IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/cabo_rate_' . md5($ip);
if (file_exists($rateFile) && (time() - filemtime($rateFile) < 30)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please wait a moment and try again.']);
    exit;
}
@touch($rateFile);

// Strip CRLF from header-bound fields to prevent injection.
function clean_header($s) { return trim(preg_replace('/[\r\n]+/', ' ', (string)$s)); }
function clean_body($s)   { return trim((string)$s); }

$firstName   = clean_header($_POST['first-name']   ?? '');
$lastName    = clean_header($_POST['last-name']    ?? '');
$email       = clean_header($_POST['email']        ?? '');
$phone       = clean_header($_POST['phone']        ?? '');
$activity    = clean_body  ($_POST['activity']     ?? '');
$sailingType = clean_body  ($_POST['sailing-type'] ?? '');
$date        = clean_body  ($_POST['date']         ?? '');
$groupSize   = clean_body  ($_POST['group-size']   ?? '');
$message     = clean_body  ($_POST['message']      ?? '');

// Detect language from the page that submitted the form
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$lang    = strpos($referer, '/es/') !== false ? 'es' : 'en';

if ($firstName === '' || $lastName === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please complete the required fields.']);
    exit;
}

$fullName     = "$firstName $lastName";
$companyEmail = 'info@cabosailing.com';

function format_label($v) {
    if ($v === '' || $v === null) return '';
    return ucwords(str_replace('-', ' ', $v));
}
$activity    = format_label($activity)    ?: ($lang === 'es' ? 'No seleccionado' : 'Not selected');
$sailingType = format_label($sailingType) ?: ($lang === 'es' ? 'No seleccionado' : 'Not selected');
$date        = $date        !== '' ? $date        : ($lang === 'es' ? 'Flexible'        : 'Flexible');
$phone       = $phone       !== '' ? $phone       : ($lang === 'es' ? 'No proporcionado' : 'Not provided');
$groupSize   = $groupSize   !== '' ? $groupSize   : ($lang === 'es' ? 'No especificado' : 'Not specified');
$message     = $message     !== '' ? $message     : ($lang === 'es' ? 'Sin mensaje'     : 'No message');

// ===== Email 1: Notify Cabo Sailing =====
// From = guest, so info@cabosailing.com sees the guest's name/email in the
// inbox From column and "Reply" goes straight back to them. Sender header
// records the true envelope origin for mail clients that surface it.
$notifySubject = 'Check availability from cabosailing website';
$notifyBody    =
    "New inquiry from cabosailing.com\n\n" .
    "Name:           $fullName\n" .
    "Email:          $email\n" .
    "Phone:          $phone\n\n" .
    "Activity:       $activity\n" .
    "Sailing Type:   $sailingType\n" .
    "Preferred Date: $date\n" .
    "Group Size:     $groupSize\n\n" .
    "Message:\n$message\n";
$notifyHeaders =
    "From: $fullName <$email>\r\n" .
    "Sender: $companyEmail\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n" .
    "X-Mailer: cabosailing.com contact form\r\n";

// ===== Email 2: Autoreply to the guest =====
if ($lang === 'es') {
    $autoSubject = 'Tu solicitud de crucero en Cabo Sailing';
    $autoBody =
        "Hola $fullName,\n\n" .
        "Listo — recibimos tu solicitud!\n" .
        "Estamos revisando disponibilidad y te responderemos pronto con las mejores opciones.\n\n" .
        "Resumen de tu Solicitud:\n" .
        "  Actividad:       $activity — $sailingType\n" .
        "  Fecha Preferida: $date\n" .
        "  Invitados:       $groupSize\n" .
        "  Nombre:          $fullName\n\n" .
        "En horario de oficina, normalmente respondemos en minutos.\n" .
        "Si tu solicitud es urgente o prefieres una respuesta mas rapida:\n" .
        "  WhatsApp: https://wa.me/526241916997\n" .
        "  Llamanos: +52 624 143 8485\n\n" .
        "— El equipo de Cabo Sailing\n";
} else {
    $autoSubject = 'Your Cabo Sailing cruise inquiry';
    $autoBody =
        "Hi $fullName,\n\n" .
        "You're all set — we've got your request!\n" .
        "We're checking availability and will get back to you shortly with the best options.\n\n" .
        "Your Request Summary:\n" .
        "  Activity:       $activity — $sailingType\n" .
        "  Preferred Date: $date\n" .
        "  Guests:         $groupSize\n" .
        "  Name:           $fullName\n\n" .
        "During office hours, we usually reply within minutes.\n" .
        "If your request is urgent or you prefer faster communication:\n" .
        "  WhatsApp: https://wa.me/526241916997\n" .
        "  Call:     +52 624 143 8485\n\n" .
        "— Cabo Sailing Team\n";
}
$autoHeaders =
    "From: Cabo Sailing <$companyEmail>\r\n" .
    "Reply-To: $companyEmail\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n" .
    "X-Mailer: cabosailing.com contact form\r\n";

$notifyOk = @mail($companyEmail, $notifySubject, $notifyBody, $notifyHeaders);
$autoOk   = @mail($email,        $autoSubject,   $autoBody,   $autoHeaders);

if (!$notifyOk) {
    http_response_code(500);
    echo json_encode(['error' => 'We could not send your message. Please try WhatsApp or email us directly.']);
    exit;
}

echo json_encode(['ok' => true, 'autoreply' => (bool)$autoOk]);
