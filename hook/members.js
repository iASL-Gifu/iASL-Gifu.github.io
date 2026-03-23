let progress = 0;
let startX = 0;
let startY = 0;
let active = 0;
let isDown = false;

const speedWheel = 0.02;
const speedDrag = -0.1;
const items = Array.from(document.querySelectorAll('.carousel-item'));
const leftButton = document.getElementById('left_btn');
const rightButton = document.getElementById('right_btn');
const step = items.length > 1 ? 100 / (items.length - 1) : 0;

const getZindex = (array, index) => array.map((_, itemIndex) => (
    index === itemIndex ? array.length : array.length - Math.abs(index - itemIndex)
));

const displayItem = (item, index, currentActive) => {
    const zIndex = getZindex(items, currentActive)[index];
    item.style.setProperty('--zIndex', zIndex);
    item.style.setProperty('--active', (index - currentActive) / items.length);
};

const animate = () => {
    if (!items.length) {
        return;
    }

    progress = Math.max(0, Math.min(progress, 101));
    active = Math.floor((progress / 100) * (items.length - 1));
    items.forEach((item, index) => displayItem(item, index, active));
};

items.forEach((item, index) => {
    item.addEventListener('click', () => {
        progress += (index - active) * step;
        animate();
    });
});

const handleWheel = (event) => {
    progress += event.deltaY * speedWheel;
    animate();
};

const handlePointerMove = (event) => {
    if (!isDown) {
        return;
    }

    const x = event.clientX || (event.touches && event.touches[0].clientX) || 0;
    const y = event.clientY || (event.touches && event.touches[0].clientY) || 0;
    const moveX = (x - startX) * speedDrag;
    const moveY = (y - startY) * speedDrag;

    progress += moveX + moveY;
    startX = x;
    startY = y;
    animate();
};

const handlePointerDown = (event) => {
    isDown = true;
    startX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
    startY = event.clientY || (event.touches && event.touches[0].clientY) || 0;
};

const handlePointerUp = () => {
    isDown = false;
};

document.addEventListener('wheel', handleWheel, { passive: true });
document.addEventListener('mousedown', handlePointerDown);
document.addEventListener('mousemove', handlePointerMove);
document.addEventListener('mouseup', handlePointerUp);
document.addEventListener('touchstart', handlePointerDown, { passive: true });
document.addEventListener('touchmove', handlePointerMove, { passive: true });
document.addEventListener('touchend', handlePointerUp);
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        progress -= step;
        animate();
    }

    if (event.key === 'ArrowRight') {
        progress += step;
        animate();
    }
});

if (leftButton) {
    leftButton.addEventListener('click', () => {
        progress -= step;
        animate();
    });
}

if (rightButton) {
    rightButton.addEventListener('click', () => {
        progress += step;
        animate();
    });
}

function goBackOrRedirect() {
    if (document.referrer) {
        window.history.back();
        return;
    }

    window.location.href = '/index.html';
}

animate();
