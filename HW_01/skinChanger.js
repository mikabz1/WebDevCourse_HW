const skins = [
    'SKINS/modern.css',
    'SKINS/classic.css',
    'SKINS/dark.css'
];

let currentSkinIndex = 0;

function changeSkin() {
    currentSkinIndex = (currentSkinIndex + 1) % skins.length;
    const linkElement = document.querySelector('link[rel="stylesheet"]');
    linkElement.href = skins[currentSkinIndex];
}