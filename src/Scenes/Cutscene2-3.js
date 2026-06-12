class Cutscene2_3 extends Phaser.Scene {
    constructor() {
        super("cutscene2_3Scene");
    }

    init(){
        this.ACCELERATION = 250;
        this.DRAG = 3000;
        this.JUMP_VELOCITY = -650;
        this.SCALE = 3;
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        
        // Load tilemap information
        this.load.image("industrial_tiles", "pixel_platformer_industrial_tilemap_packed.png");
        this.load.image("food_tiles", "tilemap_packed_food.png");
        this.load.image("backgrounds_pink_tiles", "tilemap-backgrounds_pink.png");
        this.load.image("background_tiles", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("cutscene2-3", "Cutscene2-3.tmj");   // Tilemap in JSON

        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", { 
            frameWidth: 18,
            frameHeight: 18 
        });

        this.load.spritesheet("tilemap_characters", "tilemap-characters_packed.png", {
            frameWidth: 22,
            frameHeight: 22,
            spacing: 2,
            margin: 1
        });

        

    }

    create() {
        this.physics.world.gravity.y = 2500;
        this.map = this.add.tilemap("cutscene2-3");
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.physics.world.checkCollision.up = false;
        this.physics.world.TILE_BIAS = 32;

        this.industrialTileset = this.map.addTilesetImage("pixel_platformer_industrial_tilemap_packed", "industrial_tiles");
        this.foodTileset = this.map.addTilesetImage("tilemap_packed_food", "food_tiles");
        this.bgPinkTileset = this.map.addTilesetImage("tilemap-backgrounds_pink", "backgrounds_pink_tiles");
        this.bgTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");

        this.sky = this.map.createLayer("Sky", [this.bgTileset, this.bgPinkTileset], 0, 0);
        this.bg = this.map.createLayer("Background", [this.industrialTileset, this.foodTileset], 0, 0);
        this.ground = this.map.createLayer("Ground", [this.industrialTileset, this.foodTileset], 0, 0);

        if(this.sys.animatedTiles) this.sys.animatedTiles.init(this.map);

        this.ground.setCollisionByProperty({
            collides: true
        });
        

        my.sprite.player = this.physics.add.sprite(30, 170, "platformer_characters", "tile_0000.png");
        my.sprite.player.setFlipX(true);
        this.physics.add.collider(my.sprite.player, this.ground);
        


        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNames('platformer_characters', {
                    prefix: "tile_", start: 0, end: 1, suffix: ".png", zeroPad: 4
                }),
                frameRate: 15,
                repeat: -1
            });
        }

        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                defaultTextureKey: "platformer_characters",
                frames: [{ frame: "tile_0000.png" }],
                repeat: -1
            });
        }


        // Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels - 100);
        this.cameras.main.setZoom(5);
        this.cameras.main.startFollow(my.sprite.player, true, 0.05, 0.05);
        my.sprite.player.body.setVelocityX(120);
        my.sprite.player.anims.play("walk", true);

        this.time.delayedCall(2000, () => {
            this.cameras.main.stopFollow();
        });
        this.time.delayedCall(4000, () =>{
            this.scene.start("loadScene");
        })
    }

    // Never get here since a new scene is started in create()
    update() {

        if(my.sprite.player.body.blocked.down){
            my.sprite.player.anims.play("walk", true);
        } else {
            my.sprite.player.anims.play("jump", true);
        }

        if (my.sprite.player.x >= 600){
            my.sprite.player.setVelocityX(0);
            my.sprite.player.body.setAcceleration(0);
            my.sprite.player.anims.play("idle", true);
        }
    }
}