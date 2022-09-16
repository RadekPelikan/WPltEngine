const entities = []
let fpsElement;
const PLAYER_SIZE = 50

const GRAVITY = 1
const PLAYER_SPEED = 3
const COLLISION_BUFFER_POS = 20

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
  static defaultCollision = {
    any: false,
    top: false,
    rig: false,
    bot: false,
    lef: false
  }

  constructor(x, y, w, h) {
    this.id = Entity.idCounter++;
    this.pos = createVector(x, y)
    this.dim = createVector(w, h)
    this.vel = createVector(0, 0)
    this.color = [255, 255, 255]
    this.type = 0
    this.resetCollision()
    this.updatePrevCollision()

    this.vel.limit(COLLISION_BUFFER_POS - 0.001)

  }

  resetCollision() {
    this.collision = Object.assign({}, Platform.defaultCollision)
  }

  updatePrevCollision() {
    this.prevCollision = Object.assign({}, this.collision)
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
      this.collision.bot = true
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
    a.updatePrevCollision()
    a.resetCollision()
    for (const entity of entities) {
      const b = entity

      if (a === b) continue
      b.updatePrevCollision()
      b.resetCollision()

      const collisionT = a.pos.y + a.dim.y >= b.pos.y
      const collisionB = a.pos.y <= b.pos.y + b.dim.y
      const collisionR = a.pos.x <= b.pos.x + b.dim.x
      const collisionL = a.pos.x + a.dim.x >= b.pos.x


      if (collisionT && collisionR && collisionB && collisionL) {
        a.collision.any = true
        b.collision.any = true

        const horCond = a.pos.x + a.dim.x > b.pos.x && a.pos.x < b.pos.x + b.dim.x
        if (collisionT && a.pos.y + a.dim.y <= b.pos.y + COLLISION_BUFFER_POS && a.vel.y >= 0 && horCond) {
          this.colideT(a, b)
          continue
        } else {
          a.collision.bot = false
          b.collision.top = false
        }
        if (collisionB && a.pos.y >= b.pos.y + b.dim.y - COLLISION_BUFFER_POS && a.vel.y <= 0 && horCond) {
          this.colideB(a, b)
          continue
        } else {
          a.collision.bot = false
          b.collision.top = false
        }

        if (collisionR && a.pos.x >= b.pos.x + b.dim.x - COLLISION_BUFFER_POS) {
          this.colideR(a, b)
        } else {
          a.collision.lef = false
          b.collision.rig = false
        }
        if (collisionL && a.pos.x + a.dim.x <= b.pos.x + COLLISION_BUFFER_POS) {
          this.colideL(a, b)
        } else {
          a.collision.rig = false
          b.collision.lef = false
        }
      }
    }
  }

  // b entity's TOP
  colideT(a, b) {
    if (a.vel.y > 0) a.vel.y = 0
    a.pos.y = b.pos.y - a.dim.y
    a.collision.bot = true
    b.collision.top = true
  }

  // b entity's BOTTOM
  colideB(a, b) {
    a.pos.y = b.pos.y + b.dim.y
    a.vel.y = 0
    a.collision.top = true
    b.collision.bot = true
  }

  // b entity's RIGHT
  colideR(a, b) {
    if (a.vel.x < 0) a.vel.x = 0
    a.collision.lef = true
    b.collision.rig = true
    // This will maybe bug out when falling, collisions may not occur for right side of b
    if (a.prevCollision.bot) a.pos.x = b.pos.x + b.dim.x
  }

  // b entity's LEFT
  colideL(a, b) {
    if (a.vel.x > 0) a.vel.x = 0
    a.collision.rig = true
    b.collision.lef = true
    // This will maybe bug out when falling, collisions may not occur for left side of b
    if (a.prevCollision.bot) a.pos.x = b.pos.x - a.dim.x
  }

}


class Player extends Entity {

  constructor(x, y) {
    super(x, y, PLAYER_SIZE, PLAYER_SIZE)
    this.color = [140, 255, 100]
    this.type = 1
    this.defaultColor = [255, 255, 255]
    this.mode = 1
  }

  update() {
    if (this.mode === 1) this.vel.add(createVector(0, GRAVITY / 3))

    this.vel.limit(COLLISION_BUFFER_POS < 20 ? COLLISION_BUFFER_POS - 0.001 : 20)
    this.pos.add(this.vel)

    this.move()
    super.update()
  }

  move() {

    switch (this.mode) {
      case 1:
        console.log(this.collision.bot)
        if (!keyIsPressed) return (this.vel.x = 0);

        // NO CONTROLS IN MIDAIR
        // if (this.collision.bot) this.vel.x = 0
        // if (!this.collision.bot) return

        if (keyIsDown(65)) {
          this.vel.x = -PLAYER_SPEED;
        }
        if (keyIsDown(68)) {
          this.vel.x = PLAYER_SPEED;
        }
        if (keyIsDown(32) && this.collision.bot) {
          this.vel.add(createVector(0, -12));
          this.collision.bot = false
        }
        break;
      case 2:
        if (!keyIsPressed) return (this.vel.mult(0));
        if (keyIsDown(87)) {
          this.vel.y = -PLAYER_SPEED;
        }
        if (keyIsDown(83)) {
          this.vel.y = PLAYER_SPEED;
        }
        if (keyIsDown(65)) {
          this.vel.x = -PLAYER_SPEED;
        }
        if (keyIsDown(68)) {
          this.vel.x = PLAYER_SPEED;
        }
        break;
    }
  }
}




class Platform extends Entity {

  constructor(x, y, w, h) {
    super(x, y, w, h)
    this.type = 2
    this.defaultColor = [255, 255, 255]
  }

  update() {
    if (this.collision.any) {
      this.color = [255, 140, 100]
    } else {
      this.color = this.defaultColor
    }

    super.update()
  }
}