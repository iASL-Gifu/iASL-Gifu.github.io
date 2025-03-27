let progress = 0
let startX = 0
let active = 0
let isDown = false

const speedWheel = 0.02
const speedDrag = -0.1

const getZindex = (array, index) => (array.map((_, i) => (index === i) ? array.length : array.length - Math.abs(index - i)))

const $items = document.querySelectorAll('.carousel-item')

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  item.style.setProperty('--active', (index-active)/$items.length)
}

const animate = () => {
  progress = Math.max(0, Math.min(progress, 101))
  active = Math.floor(progress/100*($items.length-1))
  
  $items.forEach((item, index) => displayItems(item, index, active))
}
animate()

$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    progress = progress+(i-active)*(100/($items.length-1))
    animate()
  })
})

const handleWheel = e => {
  const wheelProgress = e.deltaY * speedWheel
  progress = progress + wheelProgress
  animate()
}

const handleMouseMove = (e) => {
  if (!isDown) return
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const y = e.clientY || (e.touches && e.touches[0].clientY) || 0
  const mouseProgressX = (x - startX) * speedDrag
  const mouseProgressY = (y - startY) * speedDrag
  progress = progress + mouseProgressX + mouseProgressY
  startX = x
  startY = y
  animate()
}

const handleMouseDown = e => {
  isDown = true
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0
  startY = e.clientY || (e.touches && e.touches[0].clientY) || 0
}

const handleMouseUp = () => {
  isDown = false
}

document.addEventListener('mousewheel', handleWheel)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
document.addEventListener('touchstart', handleMouseDown)
document.addEventListener('touchmove', handleMouseMove)
document.addEventListener('touchend', handleMouseUp)

document.getElementById('left_btn').onclick = function() {
  progress = progress-(100/($items.length-1))
  animate()
};

document.getElementById('right_btn').onclick = function() {
  progress = progress+(100/($items.length-1))
  animate()
};

function goBackOrRedirect() {
  if (document.referrer) {
      window.history.back();
  } else {
      window.location.href = "index.html";
  }
}
