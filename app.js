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
	mouse.justDown = true // this is reset at the end of the update loop
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
	* @param {XYObj} target - mouse or other {x,y} object
	* @param {Array} group - array of Cards or other {x,y,w,h} object
	* @returns array of GameObject that the target is within 
	*/
const detectHit = (target,group) => group.filter( item => 
	target.x >= item.x &&
	target.x <= item.x + item.w && 
	target.y >= item.y &&
	target.y <= item.y + item.h
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
	justDown:false,
	down:false,
	drag:false,
	dragXDist:0,
	dragYDist:0,
	clickdown:0,
	clickup:0
}

const canvasStyles = {
	default: {
		fillStyle: '#333',
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

// const checkMouse = () => {
// 	if(mouse.down && !mouse.drag){
// 		// clicking
// 		let card = detectHit(mouse,cards).reverse()[0]
// 		if(card && mouse.ready){
// 			mouse.drag = card
// 			mouse.ready = false
// 			card.xoffset = mouse.x-card.x
// 			card.yoffset = mouse.y-card.y
// 			card.click = mouse.click
// 			console.log('🖐grab!')
// 			// move to top of z index
// 			let i = cards.indexOf(card)
// 			cards.splice(i,1)
// 			cards.push(card)
// 		}
// 	} else if(!mouse.down && mouse.drag){
// 		// moving while mouse is up with card selected
// 		// move the card with the mouse by the offset
// 		const card = mouse.drag
// 		card.x = mouse.x-card.xoffset
// 		card.y = mouse.y-card.yoffset
// 		console.log('⏩move')
// 	} else if(mouse.down && mouse.drag){
// 		const card = mouse.drag
// 		if(card.click === mouse.click){
// 			// do nothing; no new clicks have happened
// 		} else {
// 			// stop dragging
// 			mouse.drag = false 
// 			console.log('✋drop')
// 			// check if we made a new stack
// 			let stackedOn = detectHit(card.centroid(),cards.filter(c => c !== card))[0]
// 			console.log(stackedOn)
// 			// debugger
// 			if(stackedOn){
// 				if(!stackedOn.stack) stackedOn.stack = new Stack(stackedOn)
// 				if(card.stack){
// 					card.stack.remove(card)
// 				}
// 				stackedOn.stack.add(card)
// 			}
// 		}
// 	} else if(!mouse.down & !mouse.drag){
// 		mouse.ready = true
// 	}
// }

const displayCards = (cards) => {
	cards.forEach( card => {
		const {x,y,w,h,click} = card
		if(card.hover){
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

function cryptoShuffleMutate(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2 ** 32 - 1) * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

/**
	* A group of cards that is confined to a space and optionally conforms to
	* rules for arrangement.
	* @param {Array} cards - array of Cards
	* @param {int} boundsX - top left corner of free zone for card placement. Leave
	* all zeroes to prevent free placement.
	* @param {int} boundsY - same as boundsX
	* @param {int} boundsWidth - same as boundsWidth
	* @param {int} boundsHeight - same as boundsHeight
	* @param {Array} validPoints - Array of [x,y] coordinate Arrays describing
	* valid places that cards may be snapped to. The first n cards in this.cards
	* will snap to these validPoints, where n is validPoints.length.
	* @param {int} max - the maximum number of cards allowed.
	* @returns array 
	*/
class Layout {
	constructor(cards = [], boundsX = 0, boundsY = 0, boundsWidth = 0, boundsHeight = 0, validPoints = [], max = Infinity ){
		// assign all props
		let args = ['cards','boundsX','boundsY','boundsWidth','boundsHeight','validPoints']
		Object.keys(arguments).forEach(k => this[args[parseInt(k)]] = arguments[parseInt(k)])
		/**
		* higher index cards are higher z-order (closer to you)
		* 0 is lowest card, length-1 is highest card
		*/
		this.cards = cards
	}
	update(){
		// detect mouse hovers.
		let hovers = detectHit(mouse,this.cards)
		// get topmost hit
		let topHover = hovers[hovers.length-1]
		// decide what to do with mouse state.
		if(topHover){
			topHover.hover=true
		}

		// detect mouse clicks.
		let mouseDownXY = {x: mouse.clickX, y: mouse.clickY}
		let clicks = detectHit(mouseDownXY,hovers)
  let topClick = clicks[clicks.length-1]
		if(topClick && mouse.justDown){
			topClick.drag=true
			topClick.xoffset = mouse.x - topClick.x
			topClick.yoffset = mouse.y - topClick.y
			// TODO bring the dragged card to the top of the deck
		}

		// do upkeep
		this.cards.forEach( card => {
			if(card.drag){
				card.x = mouse.x - card.xoffset
				card.y = mouse.y - card.yoffset
			}
			card.hover = false
			if(!mouse.down){
				card.drag = false
				let index = this.cards.indexOf(card)
				if(index < this.validPoints.length){
					// constrain to validPoint
					let [origX,origY] = this.validPoints[index]
					// TODO determine which is the closest unoccupied validPoint available
					// TODO ensure the resulting card.x/y is inside Bounds if defined
					card.x = origX 
					card.y = origY
				}
			}
			// maintain hover state on the topmost hovered card
			if(card === topHover){
				card.hover = true
			}
		})
	}
	display(){
		// this.cards.map(card => card.draw())
		displayCards(this.cards)
	}
	add(card){
		if(this.cards.length >= this.max){return false}
		let index = this.cards.length // the index it will be put at
		if(index > this.max){ return false }
		if(index < this.validPoints.length-1){
			let [x,y] = this.validPoints[index]
			// modify card coords
			card.x = x
			card.y = y
		}
		this.cards.push(card)
	}
	addMultiple(cards){
		cards.forEach(card => this.add(card))
	}
}

/**
	* A stack of cards that is either face-up or face-down. If x and y is not
	* specified, then the pile will exist wherever the first (lowest index) card is.
	* @param {Array} cards - array of Cards.higher index cards are higher z-order 
	* (closer to you). 0 is lowest card, length-1 is highest card.
	* @param {Boolean} faceUp - the direction that all cards in this pile will face
	* @param {int} x - Optional. The x coord that this pile will be forced.
	* @param {int} y - Optional. The y coord that this pile will be forced.
	* @returns array 
	*/
class Pile {
	constructor(cards = [], faceUp = false, x=null, y=null){
		this.cards = cards
		this.face = faceUp
		if(x===null && y===null){
			this._setXY()
		}
	}
	/** 
		* set the XY coords of this pile to the bottommost card's xy
		* @returns boolean: success
		*/
	_setXY(){
		let bottomCard = this.cards[0]
		if(typeof bottomCard === 'object' && bottomCard.constructor.name === 'Card'){
			this.x = bottomCard.x
			this.y = bottomCard.y
			return true
		}
		return false
	}
	/** 
		* draw function = display, so as to not get mixed up with drawing a card off
		* the top of the pile
		*/
	display(){
		// this.cards.map(card => card.draw())
		displayCards(this.cards)
	}
 shuffle(){
		cryptoShuffleMutate(this.cards)
	}
	addToTop(card){
		this.cards.push(card)
	}
	/** 
		* @param {Card} card - the card to add to the bottom
		* @param {Boolean} moveTo - true: move the pile to this new card's x/y.
		*/
	addToBottom(card, moveTo = false){
		this.cards.unshift(card)
		if(moveTo){
			this._setXY()
		}
	}
	addShuffle(card, moveTo = false){
		let proxy = new Array(this.cards.length)
		proxy.push(card)
		cryptoShuffleMutate(proxy)
		let index = proxy.indexOf(card)
		this.cards.splice(index,0,card)
		if(moveTo){
			this._setXY()
		}
	}
	/**
		* Draw a card off the top of this pile and put it 
		* @param {function} targetAdd - the new Pile or Layout's add function to handle where the card goes.
		*/
	draw(targetAdd){
		let card = this.cards.pop()
		targetAdd(card)
	}
}

const init = () => {
	GameBoard = new Layout([],0,0,window.innerWidth,window.innerHeight,[[10,10],[50,50],[70,25]])
	GameBoard.addMultiple([
		new Card({x:10,y:10}),
		new Card({x:50,y:10}),
		new Card({x:100,y:10}),
		new Card({x:200,y:200}),
	])
	// begin loop
	requestAnimationFrame(update)
}

const update = () => {
	// console.log('justdown',mouse.justDown,'down',mouse.down)
	frame++
	// update logic
	GameBoard.update()
	// display updates
	display()
	mouse.justDown = false
}

const display = () => {
	// draw logic
	cls()
	GameBoard.display()
	// loop
	requestAnimationFrame(update)
}


// class definitions
class Card {
	constructor(opts){
		/**
		 * dirty, but this is prototyping
		 * assign all options to local properties without discriminaton
		 */
		this.w = 90
		this.w_orig = this.w
		this.h = 120
		this.h_orig = this.h
		this.x = 0
		this.xoffset = 0
		this.y = 0
		this.yoffset = 0
		this.click = -1
		this.hover = false
		// assign all props
		Object.keys(opts).forEach(k => this[k] = opts[k])
		// add to cards
		// cards.push(this)
	}
	/**
	 * Used for hit detection
	 * @returns center point of card
	 */
	centroid(){
		let x = this.x + this.w/2
		let y = this.y + this.h/2
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
init()