const entities = []
let fpsElement;
const PLAYER_SIZE = 50

const GRAVITY = 1
const PLAYER_SPEED = 3
const COLLISION_BUFFER_POS = 10

function setup() {
  createCanvas(700, 700)
  noStroke()
  entities.push(new Player(200, 100))
  entities.push(new Platform(100, height - 100, width - 200, 100))
  entities.push(new Platform(0, height - 10, width, 10))
  entities.push(new Platform(0, height - 200, 100, 10))

  entities.push(new Platform(250, height - 300, 300, 40))
  entities.push(new Platform(350, height - 450, 300, 40))
  entities.push(new Platform(450, height - 600, 300, 40))

  fpsElement = createP()
  fpsElement.class("fps-counter")
}

function draw() {
  background(50)

  for (const entity of entities) {
    entity.update()
    entity.show()
  }

  if (frameCount % 10 === 0) {
    fpsElement.html(Math.floor(frameRate()))
  }
}


class Entity {
  static idCounter = 1

  constructor(x, y, w, h) {
    this.id = Entity.idCounter++;
    this.pos = createVector(x, y)
    this.dim = createVector(w, h)
    this.vel = createVector(0, 0)
    this.color = [255, 255, 255]
    this.type = 0

    this.vel.limit(COLLISION_BUFFER_POS - 0.001)

  }

  update() {
    this.validatePosition()
  }


  show() {
    fill(this.color)
    rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y)
  }


  validatePosition() {

    // Prepared for moving platforms
    if (this.type !== 1) return

    if (this.pos.y < 0) {
      this.pos.y = 0
      this.vel.y = 0
    }
    if (this.pos.y + this.dim.y >= height) {
      this.pos.y = height - this.dim.y
      this.onGround = true
    }
    if (this.pos.x <= 0) {
      this.pos.x = 0
    }
    if (this.pos.x + this.dim.x >= width) {
      this.pos.x = width - this.dim.x
    }

    // if (this.type === 1) {
    //   this.checkCollisions()
    // }
    this.checkCollisions()

  }

  checkCollisions() {
    const a = this
    a.onGround = false
    for (const entity of entities) {
      const b = entity

      if (a === b) continue

      const collisionT = a.pos.y + a.dim.y > b.pos.y
      const collisionR = a.pos.x < b.pos.x + b.dim.x
      const collisionB = a.pos.y < b.pos.y + b.dim.y
      const collisionL = a.pos.x + a.dim.x > b.pos.x


      if (collisionT && collisionR && collisionB && collisionL) {
        if (collisionT && a.pos.y + a.dim.y < b.pos.y + COLLISION_BUFFER_POS && a.vel.y >= 0) {
          if (a.vel.y > 0) a.vel.y = 0
          a.pos.y = b.pos.y - a.dim.y
          a.onGround = a.vel.y === 0
          continue
        } else if (collisionB && a.pos.y > b.pos.y + b.dim.y - COLLISION_BUFFER_POS && a.vel.y <= 0) {
          a.pos.y = b.pos.y + b.dim.y
          a.vel.y = 0
          continue
        }

        if (collisionR && a.pos.x > b.pos.x + b.dim.x - COLLISION_BUFFER_POS) {
          a.pos.x = b.pos.x + b.dim.x
          a.vel.x = 0
        } else if (collisionL && a.pos.x + a.dim.x < b.pos.x + COLLISION_BUFFER_POS) {
          a.pos.x = b.pos.x - a.dim.x
          a.vel.x = 0
        }
      }



    }
  }

}


class Player extends Entity {

  constructor(x, y) {
    super(x, y, PLAYER_SIZE, PLAYER_SIZE)
    this.color = [140, 255, 100]
    this.onGround = false
    this.type = 1
  }

  update() {

    this.vel.add(createVector(0, GRAVITY / 4))
    this.pos.add(this.vel)

    this.move()
    super.update()
  }

  move() {
    if (!keyIsPressed) return (this.vel.x = 0);

    // NO CONTROLS IN MIDAIR
    // if (this.onGround) this.vel.x = 0
    // if (!this.onGround) return

    if (keyIsDown(65)) {
      this.vel.x = -PLAYER_SPEED;
    }
    if (keyIsDown(68)) {
      this.vel.x = PLAYER_SPEED;
    }
    if (keyIsDown(32) && this.onGround) {
      this.vel.add(createVector(0, -10));
    }
  }

}


class Platform extends Entity {

  constructor(x, y, w, h) {
    super(x, y, w, h)
    this.type = 2
  }
}