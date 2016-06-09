<?php
header("Content-type: text/css; charset: UTF-8");

$Directory = new RecursiveDirectoryIterator('fonts/');
$Iterator = new RecursiveIteratorIterator($Directory);
$files = new RegexIterator($Iterator, '/^.+\.ttf$/i');
?>
<?php foreach ($files as $file) :
    $familyName = basename($file->getFilename(), '.ttf');
    ?>
/* cyrillic */
@font-face {
    font-family: '<?= $familyName ?>';
    font-style: normal;
    font-weight: 400;
    src: url(<?= $file ?>) format('ttf');
}
<?php endforeach; ?>