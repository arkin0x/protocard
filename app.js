// protocard

// canvas
$cv = document.getElementById('cv')
$ctx = $cv.getContext('2d')

// resize canvas
const resizeWindow = function(){
	$cv.height = window.innerHeight
	$cv.width = window.innerWidth
}
resizeWindow()
window.addEventListener('resize',resizeWindow)

// track mouse position
const updateMouse = (e) => {
	mouse.x = e.pageX
	mouse.y = e.pageY
	// console.log(mouse.x, mouse.y)
}
const updateMouseDown = (e) => {
	mouse.down = true
	mouse.click++
}
const updateMouseUp = (e) => {
	mouse.down = false 
}

const handleDrag = (e) => {
	// detect hit on existing
	// highest card selected
	detectHit(cards).reverse()[0]?.drag()
}

const detectHit = arr => arr.filter( el => 
	mouse.x >= el.x &&
	mouse.x <= el.x + el.w && 
	mouse.y >= el.y &&
	mouse.y <= el.y + el.h
)

document.onmousemove = updateMouse
document.onmousedown = updateMouseDown
document.onmouseup = updateMouseUp

// globals
var frame = 0
var mouse = {x:0,y:0,down:false,drag:null,click:0}

/**
 * higher index cards are higher z-order (closer to you)
 */
const cards = []

const canvasStyles = {
	default: {
		fillStyle: '#fff',
		strokeStyle: '#000',
		lineWidth: '1',
	},
	card: {
		fillStyle: '#eee',
		strokeStyle: '#777',
		lineWidth: '2',
	},
	cardMoving: {
		fillStyle: '#eee9',
		strokeStyle: '#777',
		lineWidth: '4',
	}
}

const drawDefaults = () => {
	Object.assign($ctx,canvasStyles.default)
}

const cls = () => {
	drawDefaults()
	$ctx.beginPath()
	$ctx.fillRect(0,0,$cv.width,$cv.height)
	$ctx.closePath()
	$ctx.fill()
}

const checkMouse = () => {
	if(mouse.down && !mouse.drag){
		// clicking
		let card = detectHit(cards).reverse()[0]
		if(card && mouse.ready){
			mouse.drag = card
			mouse.ready = false
			card.xoffset = mouse.x-card.x
			card.yoffset = mouse.y-card.y
			card.click = mouse.click
			console.log('🖐grab!')
			// move to top of z index
			let i = cards.indexOf(card)
			cards.splice(i,1)
			cards.push(card)
		}
	} else if(!mouse.down && mouse.drag){
		// moving while mouse is up with card selected
		// move the card with the mouse by the offset
		const card = mouse.drag
		card.x = mouse.x-card.xoffset
		card.y = mouse.y-card.yoffset
		console.log('⏩move')
	} else if(mouse.down && mouse.drag){
		const card = mouse.drag
		if(card.click === mouse.click){
			// do nothing; no new clicks have happened
		} else {
			// stop dragging
			mouse.drag = false 
			console.log('✋drop')
		}
	} else if(!mouse.down & !mouse.drag){
		mouse.ready = true
	}
}

const drawCards = () => {
	cards.forEach( el => {
		const {x,y,w,h,click} = el
		if(click===mouse.click){
			//currently moving
			Object.assign($ctx,canvasStyles.cardMoving)
		} else {
			Object.assign($ctx,canvasStyles.card)
		}
		$ctx.beginPath()
		$ctx.moveTo(x,y)
		$ctx.lineTo(x+w,y)
		$ctx.lineTo(x+w,y+h)
		$ctx.lineTo(x,y+h)
		$ctx.lineTo(x,y)
		$ctx.closePath()
		$ctx.stroke()
		$ctx.fill()
	})
	drawDefaults()
}

const update = () => {
	frame++
	// update logic
	checkMouse()
	// draw updates
	draw()
}

const draw = () => {
	// draw logic
	cls()
	drawCards()
	// loop
	requestAnimationFrame(update)
}

requestAnimationFrame(update)

// class definitions
class Card {
	constructor(opts){
		/**
		 * dirty, but this is prototyping
		 * assign all options to local properties without discriminaton
		 */
		this.w = 90
		this.h = 120
		this.x = 0
		this.xoffset = 0
		this.y = 0
		this.yoffset = 0
		this.click = -1
		Object.keys(opts).forEach(k => this[k] = opts[k])
		cards.push(this)
	}
	click(){
		console.log(this)
	}
}

new Card({x:0,y:0})
new Card({x:100,y:0})