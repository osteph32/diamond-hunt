class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    init(){
        this.ACCELERATION = 250;
        this.DRAG = 3000;
        this.JUMP_VELOCITY = -650;
        this.SCALE = 2.5;
        this.startedIntro = false;
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png"); 
        this.load.image("background_tiles", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("start", "start.tmj");   // Tilemap in JSON

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
        this.map = this.add.tilemap("start");
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.physics.world.checkCollision.up = false;
        this.physics.world.TILE_BIAS = 32;

        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.bgTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");

        this.sky = this.map.createLayer("Sky", this.bgTileset, 0, 0);
        this.bg = this.map.createLayer("Background", this.tileset, 0, 0);
        this.ground = this.map.createLayer("Ground", this.tileset, 0, 0);

        this.ground.setCollisionByProperty({
            collides: true
        });

        my.sprite.player = this.physics.add.sprite(30, 200, "platformer_characters", "tile_0000.png");
        this.physics.add.collider(my.sprite.player, this.ground);
        


        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });


        // Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels - 100);
        this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);

        this.cameras.main.setZoom(this.SCALE);

        this.titleText = this.add.text(this.cameras.main.width / 2, 100, "Diamond Hunt", {fontSize: "42px", color: '#ffffff', stroke: '#000000', strokeThickness: 6}).setOrigin(0.5).setScrollFactor(0).setDepth(100).setScale(2);
        const diamondIcon1 = this.add.image(this.titleText.x + 360, this.titleText.y, 'tilemap_sheet', 67).setOrigin(0.5).setScale(4);
        const diamondIcon2 = this.add.image(this.titleText.x - 360, this.titleText.y, 'tilemap_sheet', 67).setOrigin(0.5).setScale(4);
        
        this.startButton = this.add.text(this.cameras.main.width / 2, 650, "Start Game", {
            fontSize: "24px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 18, y: 19}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive();

        this.levelSelectButton = this.add.text(this.cameras.main.width / 3, 650, "Level Select", {
            fontSize: "24px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 18, y: 19}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive();

        this.creditsButton = this.add.text(this.cameras.main.width / 1.55, 650, "Credits", {
            fontSize: "24px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 18, y: 19}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive();

        this.startButton.on("pointerdown", () => {
            selectedLevel = 1;
            this.scene.start("loadScene");
        });
        this.startButton.on("pointerover", () => { this.startButton.setScale(1.1); });
        this.startButton.on("pointerout", () => { this.startButton.setScale(1); });

        this.levelSelectButton.on("pointerdown", () => { this.scene.start("levelSelectScene"); });
        this.levelSelectButton.on("pointerover", () => { this.levelSelectButton.setScale(1.1); });
        this.levelSelectButton.on("pointerout", () => { this.levelSelectButton.setScale(1); });

        this.creditsButton.on("pointerdown", () => { this.scene.start("creditsScene"); });
        this.creditsButton.on("pointerover", () => { this.creditsButton.setScale(1.1); });
        this.creditsButton.on("pointerout", () => { this.creditsButton.setScale(1); });

        this.cameras.main.ignore([this.titleText, this.startButton, this.levelSelectButton, this.creditsButton, diamondIcon1, diamondIcon2]);
        this.uiCamera.ignore([this.sky, this.bg, this.ground, my.sprite.player]);
    }

    // Never get here since a new scene is started in create()
    update() {
        if(!this.startedIntro){
            return;
        }

        my.sprite.player.body.setVelocityX(120);

        if(my.sprite.player.body.blocked.down){
            my.sprite.player.anims.play("walk", true);
        } else {
            my.sprite.player.anims.play("jump", true);
        }

        if (my.sprite.player.x >= 300){
            my.sprite.player.setVelocityX(0);
            my.sprite.player.body.setAcceleration(0);
            my.sprite.player.anims.play("idle", true);
            this.startedIntro = false;
        }
    }
}