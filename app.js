// protocard

const STACK_OFFSET_X = 5
const STACK_OFFSET_Y = 5

// canvas
$cv = document.getElementById('cv')
$ctx = $cv.getContext('2d')

// resize canvas
const resizeWindow = function(){
	$cv.height = window.innerHeight
	$cv.width = window.innerWidth
}
resizeWindow()//trigger initial resize
window.addEventListener('resize',resizeWindow)

// track mouse position
const updateMousePos = (e) => {
	mouse.x = e.pageX
	mouse.y = e.pageY
	// console.log(mouse.x, mouse.y)
}
const updateMouseDown = (e) => {
	mouse.down = true
	mouse.clickX = mouse.x 
	mouse.clickY = mouse.y 
	mouse.clickdown++
}
const updateMouseUp = (e) => {
	mouse.down = false
	mouse.dragXDist = mouse.clickX - mouse.x 
	mouse.dragYDist = mouse.clickY - mouse.y 
	mouse.clickup++
}

/**
	* 
	* @param {GameObject} target - GameObject 
	* @param {Array} arr - array of GameObjects 
	* @returns array of GameObject that the target is within 
	*/
const detectHit = (target,arr) => arr.filter( el => 
	target.x >= el.x &&
	target.x <= el.x + el.w && 
	target.y >= el.y &&
	target.y <= el.y + el.h
)

document.onmousemove = updateMousePos
document.onmousedown = updateMouseDown
document.onmouseup = updateMouseUp

// globals
var frame = 0
var mouse = {
	clickX:false,
	clickY:false,
	x:0,
	y:0,
	down:false,
	drag:false,
	dragXDist:0,
	dragYDist:0,
	clickdown:0,
	clickup:0
}

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

const updateMouse = () => {
	checkClick()
	checkDrag()
}

/**
	* Check if we have just clicked on a card
	* and trigger applicable effects.
	*/
const checkClick = () => {

}

/**
	* Check if we are dragging a card and trigger
	* applicable effects.
	*/
const checkDrag = () => {
 
}

const checkMouse = () => {
	if(mouse.down && !mouse.drag){
		// clicking
		let card = detectHit(mouse,cards).reverse()[0]
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
			// check if we made a new stack
			let stackedOn = detectHit(card.centroid(),cards.filter(c => c !== card))[0]
			console.log(stackedOn)
			// debugger
			if(stackedOn){
				if(!stackedOn.stack) stackedOn.stack = new Stack(stackedOn)
				if(card.stack){
					card.stack.remove(card)
				}
				stackedOn.stack.add(card)
			}
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
		// assign all props
		Object.keys(opts).forEach(k => this[k] = opts[k])
		// add to cards
		cards.push(this)
	}
	/**
	 * Used for hit detection
	 * @returns center point of card
	 */
	centroid(){
		let x = (this.x + this.x + this.w)/2
		let y = (this.y + this.y + this.h)/2
		return {x,y}
	}
}

class Stack {
	constructor(card){
		this.x = card.x
		this.y = card.y
		this.height = 1
		// Object.keys(opts).forEach(k => this[k] = opts[k])
	}
	add(card){
		card.stack = this
		card.x = this.x + STACK_OFFSET_X * this.height
		card.y = this.y + STACK_OFFSET_Y * this.height
		this.height++
	}
	remove(card){
		card.stack = null
	}
}

//---

new Card({x:10,y:10})
new Card({x:110,y:10})
new Card({x:210,y:10})