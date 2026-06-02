class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1000;
        this.MAX_SPEED = 190;
        this.DRAG = 1000;  
        this.TURN_ACCELERATION = 3000;  
        this.physics.world.gravity.y = 2500;
        this.JUMP_VELOCITY = -650;
        this.SCALE = 2.5;
        this.PARTICLE_VELOCITY = 50;
        this.hasDoubleJumped = false; // Oliver - Fixing Double Jump pt.1
        this.score = 0;
        this.diamondsLeft = 6;
        this.levelEnd = false;
        this.showNeedDiamondsText = false;
        this.finalScoreText = false;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("stage-1");

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.physics.world.checkCollision.up = false;
        
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.bgTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");
        this.industrialTileset = this.map.addTilesetImage("pixel_platformer_industrial_tilemap_packed", "industrial_tiles");

        this.skyLayer = this.map.createLayer("Sky", this.bgTileset, 0, 0);

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tileset, this.industrialTileset], 0, 0);

        this.waterLayer = this.map.createLayer("Water-n-Spikes", [this.tileset, this.industrialTileset], 0, 0);
        
        this.fallingPlatforms = this.map.createLayer("falling-platforms", [this.tileset, this.industrialTileset], 0, 0);

        this.aesthetics = this.map.createLayer("aesthetics", [this.tileset, this.industrialTileset], 0, 0);

        this.enemyCollisionLayer = this.map.createLayer("Enemy-Collision", this.tileset, 0, 0);

        this.waterLayer.setCollisionByProperty({
            hazard: true
        });

        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.groundLayer.forEachTile(tile => {
            if (tile.properties.oneway === true){
                tile.setCollision(false, false, true, false);
            }
        });

        this.fallingPlatforms.setCollisionByProperty({
            collides: true
        });


        this.fallingPlatforms.forEachTile(tile => {
            if (tile.properties.oneway === true){
                tile.setCollision(false, false, true, false);
            }
        });

        this.enemyCollisionLayer.setCollisionByProperty({
            collides: true
        });
        this.enemyCollisionLayer.setVisible(false);

        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.diamonds = this.map.createFromObjects("Diamonds", {
            name: "diamond",
            key: "tilemap_sheet",
            frame: 67
        });

        this.checkpointFlags = this.map.createFromObjects("Checkpoints", {
            name: "checkpoint_flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.checkpointPoles = this.map.createFromObjects("Checkpoints", {
            name: "checkpoint_pole",
            key: "tilemap_sheet",
            frame: 131
        });

        this.endFlag = this.map.createFromObjects("Final_Checkpoint", {
            name: "end_flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.endPoles = this.map.createFromObjects("Final_Checkpoint", {
            name: "end_pole",
            key: "tilemap_sheet",
            frame: 131
        });

        this.unkillableEnemies = this.map.createFromObjects("Unkillable_Enemies", {
            name: "unkillable_enemies",
            key: "tilemap_characters",
            frame: 16
        });

        this.flyingEnemies = this.map.createFromObjects("Flying_Enemies", {
            name: "flying_enemies",
            key: "tilemap_characters",
            frame: 24
        });

        this.enemies = this.map.createFromObjects("Enemies", {
            name: "enemies",
            key: "tilemap_characters",
            frame: 18
        });

        this.mines = this.map.createFromObjects("Mines", {
            name: "mines",
            key: "tilemap_characters",
            frame: 8
        });

        // vfx
        my.vfx = {};
        my.vfx.movement = this.add.particles(0, 0, "walk_vfx", {
            scale: {start: 0.05, end: 0},
            lifespan: 350,
            gravityY: -this.PARTICLE_VELOCITY,
            alpha: {start: 0.3, end: 0.1},
        });

        my.vfx.movement.stop();

        my.vfx.doubleJump = this.add.particles(0, 0, "double_jump_vfx", {
            scale: {start: 0.05, end: 0},
            lifespan: 500,
            alpha: {start: 0.3, end: 0.1}
        });

        my.vfx.doubleJump.stop();

        my.vfx.enemyPoof = this.add.particles(0, 0, "enemy_poof", {
            scale: {start: 0.05, end: 0},
            lifespan: 500,
            alpha: {start: 0.3, end: 0.1}
        });

        my.vfx.enemyPoof.stop();

        my.vfx.explosion = this.add.particles(0, 0, "explosion_vfx", {
            scale: {start: 0.1, end: 0},
            lifespan: 1500,
            alpha: {start: 0.3, end: 0.1} 
        });

        my.vfx.explosion.stop();

        my.vfx.coinCollect = this.add.particles(0, 0, "coin_collect_vfx", {
            scale: {start: 0.07, end: 0},
            lifespan: 500, 
            alpha: {start: 0.3, end: 0.1}
        });

        //sfx
        this.player_hit_sfx = this.sound.add('player_hit_sfx', {
            volume: 0.5,
            loop: false
        });

        this.enemy_kill_sfx = this.sound.add('enemy_kill_sfx', {
            volume: 0.5,
            loop: false
        });

        this.coinPickup_sfx = this.sound.add('coinPickup_sfx', {
            volume: 0.5,
            loop: false
        });

        this.diamondPickup_sfx = this.sound.add('diamondPickup_sfx', {
            volume: 0.5,
            loop: false
        });
        
        this.explosion_sfx = this.sound.add('explosion_sfx', {
            volume: 0.5, 
            loop: false
        });
        
        this.jump_sfx = this.sound.add('jump_sfx', {
            volume: 0.5, 
            loop: false
        });

        this.checkpoint_sfx = this.sound.add('checkpoint_sfx', {
            volume: 0.5,
            loop: false
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.checkpointFlags, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.checkpointPoles, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endFlag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endPoles, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.unkillableEnemies);
        this.physics.world.enable(this.flyingEnemies);
        this.physics.world.enable(this.enemies);
        this.physics.world.enable(this.mines);


        this.checkpointFlagGroup  = this.add.group(this.checkpointFlags);
        this.checkpointPoleGroup = this.add.group(this.checkpointPoles);
        this.checkpointFlagGroup.playAnimation('flag_wave');

        this.endFlagGroup = this.add.group(this.endFlag);
        this.endPoleGroup = this.add.group(this.endPoles);
        this.endFlagGroup.playAnimation('flag_wave');

        this.coinGroup = this.add.group(this.coins);
        this.coinGroup.playAnimation('coin_spin');

        this.diamondGroup = this.add.group(this.diamonds);
        this.diamonds.forEach(diamond => {
            this.tweens.add({
                targets: diamond, 
                y: diamond.y - 5,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        this.unkillableEnemyGroup = this.add.group(this.unkillableEnemies);
        this.flyingEnemyGroup = this.add.group(this.flyingEnemies);
        this.enemyGroup = this.add.group(this.enemies);
        this.mineGroup = this.add.group(this.mines);

        this.unkillableEnemyGroup.children.iterate(enemy => {
            enemy.body.setVelocityX(-50);
            enemy.body.setCollideWorldBounds(false);
            enemy.body.setBounceX(1);
        });

        this.enemyGroup.children.iterate(enemy => {
            enemy.body.setVelocityX(-50);
            enemy.body.setCollideWorldBounds(false);
            enemy.body.setBounceX(1);
        });
        
        this.flyingEnemyGroup.children.iterate(enemy => {
            enemy.body.setAllowGravity(false);
        });

        this.mineGroup.children.iterate(mine => {
            mine.body.setAllowGravity(false);
            
            this.tweens.add({
                targets: mine, 
                y: mine.y + 100,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        my.sprite.player = this.physics.add.sprite(30, 200, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocityX(this.MAX_SPEED);
        this.spawnX = my.sprite.player.x;
        this.spawnY = my.sprite.player.y;

        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.waterLayer, (obj1, obj2) => {
            this.player_hit_sfx.play();
            this.respawnPlayer(obj1);
        });

        //falling platforms 
        this.fallenPlatformTiles = [];
        this.triggeredFallingTiles = new Set();

        this.fallingPlatformSprites = this.physics.add.group({
            allowGravity: false, 
            immovable: true
        });

        this.physics.add.collider(my.sprite.player, this.fallingPlatformSprites);
        this.physics.add.collider(my.sprite.player, this.fallingPlatforms, (player, tile) => {
            if (player.body.velocity.y < 0){
                return;
            }

            let tileKey = tile.x + "," + tile.y;

            if(this.triggeredFallingTiles.has(tileKey)){
                return;
            }

            this.triggeredFallingTiles.add(tileKey);

            this.startFallingPlatforms(tile);
        }, null, this);

        this.physics.add.collider(this.enemyGroup, this.enemyCollisionLayer);
        this.physics.add.collider(this.unkillableEnemyGroup, this.enemyCollisionLayer);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            my.vfx.coinCollect.explode(10, obj2.x, obj2.y);
            this.coinPickup_sfx.play();
            this.score += 25;
            this.scoreText.setText(String(this.score).padStart(4, "0"));
        });
        
        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy();
            this.diamondPickup_sfx.play();
            this.diamondsLeft -= 1;
            this.diamondText.setText(String(this.diamondsLeft));
        });

        // enemy detection
        this.physics.add.overlap(my.sprite.player, this.enemyGroup, (player, enemy) => {
            if(player.body.velocity.y > 0 && player.y < enemy.y){
                enemy.destroy();
                my.vfx.enemyPoof.explode(10, enemy.x, enemy.y);
                this.enemy_kill_sfx.play();
                player.body.setVelocityY(this.JUMP_VELOCITY / 1.5);
                let enemyScoreText = this.add.text(enemy.x, enemy.y, "+100", { fontSize: '8px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setDepth(10);

                this.uiCamera.ignore(enemyScoreText);

                this.score += 100;
                this.scoreText.setText(String(this.score).padStart(4, "0"));
                this.tweens.add({
                    targets: enemyScoreText,
                    y: enemy.y - 10,
                    duration: 500,
                    ease: 'Power1',
                    onComplete: () => {
                        this.tweens.add({
                            targets: enemyScoreText,
                            alpha: 0,
                            duration: 250,
                            ease: 'linear',
                            onComplete: () => {
                                enemyScoreText.destroy();
                            }
                        });
                    }
                });
            } else {
                this.respawnPlayer(player);
                this.player_hit_sfx.play();
                player.body.setVelocity(0, 0);
            }
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.unkillableEnemyGroup, (player, enemy) => {
            this.player_hit_sfx.play();
            this.respawnPlayer(player)
            player.body.setVelocity(0, 0);
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.flyingEnemyGroup, (player, enemy) => {
            if(player.body.velocity.y > 0 && player.y < enemy.y){
                enemy.destroy();
                my.vfx.enemyPoof.explode(10, enemy.x, enemy.y);
                this.enemy_kill_sfx.play();
                player.body.setVelocityY(this.JUMP_VELOCITY / 1.5);
                let enemyScoreText = this.add.text(enemy.x, enemy.y, "+150", { fontSize: '8px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setDepth(10);

                this.uiCamera.ignore(enemyScoreText);

                this.score += 150;
                this.scoreText.setText(String(this.score).padStart(4, "0"));
                this.tweens.add({
                    targets: enemyScoreText,
                    y: enemy.y - 10,
                    duration: 500,
                    ease: 'Power1',
                    onComplete: () => {
                        this.tweens.add({
                            targets: enemyScoreText,
                            alpha: 0,
                            duration: 250,
                            ease: 'linear',
                            onComplete: () => {
                                enemyScoreText.destroy();
                            }
                        });
                    }
                });
            } else {
                this.respawnPlayer(player);
                this.player_hit_sfx.play();
                player.body.setVelocity(0, 0);
            }
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.mineGroup, (player, mine) => {
            mine.destroy();
            my.vfx.explosion.explode(10, mine.x, mine.y);
            this.explosion_sfx.play();
            this.respawnPlayer(player);
            player.body.setVelocity(0, 0);
        }, null, this);

        // checkpoint flag overlap detection
        this.physics.add.overlap(my.sprite.player, this.checkpointFlagGroup, (player, checkpoint) => {
            if(checkpoint.activated){
                return;
            }

            checkpoint.activated = true; 
            this.spawnX = checkpoint.x;
            this.spawnY = checkpoint.y;

            this.checkpoint_sfx.play();

            let checkpointText = this.add.text(checkpoint.x - 70, checkpoint.y - 30, "Checkpoint reached!", { fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setDepth(10);

            this.uiCamera.ignore(checkpointText);

            this.tweens.add({
                targets: checkpointText,
                alpha: 1,
                y: checkpoint.y - 40,
                duration: 500,
                ease: 'Power1',
                onComplete: () => {
                    this.tweens.add({
                        targets: checkpointText,
                        alpha: 0,
                        duration: 250,
                        ease: 'linear',
                        onComplete: () => {
                            checkpointText.destroy();
                        }
                    });
                }
            });
        });

        // end flag overlap detection
        this.physics.add.overlap(my.sprite.player, this.endFlagGroup, (player, endFlag) => {
            if(this.levelEnd){
                return;
            }
            if (this.diamondsLeft > 0){
                this.showRemainingDiamondsText(endFlag);
                return;
            }
            this.checkpoint_sfx.play();
            this.startlevelEnd(player);
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.endPoleGroup, (player, endFlag) => {
            if(this.levelEnd){
                return;
            }
            if (this.diamondsLeft > 0){
                this.showRemainingDiamondsText(endFlag);
                return;
            }
            this.checkpoint_sfx.play();
            this.startlevelEnd(player);
        }, null, this);

        // UI Elements
        const scoreLabel = this.add.text(10, 5, 'Score:', { fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setScale(1.5);
        this.scoreText = this.add.text(10, 35, '0000', { fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setScale(1.5);

        const diamondIcon = this.add.image(this.cameras.main.width - 10, 10, 'tilemap_sheet', 67).setOrigin(1, 0).setScale(2);
        this.diamondText = this.add.text(this.cameras.main.width - 45, 10, this.diamondsLeft, { fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(1, 0).setScale(1.5);

        this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);

        this.cameras.main.ignore([scoreLabel, this.scoreText, diamondIcon, this.diamondText]);

        this.uiCamera.ignore([
            this.skyLayer, 
            this.groundLayer, 
            this.waterLayer, 
            this.fallingPlatforms, 
            this.aesthetics, 

            this.coinGroup, 
            this.diamondGroup, 
            this.checkpointFlagGroup, 
            this.checkpointPoleGroup, 
            this.endFlagGroup, 
            this.endPoleGroup, 

            this.unkillableEnemyGroup,
            this.flyingEnemyGroup,
            this.enemyGroup,
            this.mineGroup,
            this.enemyCollisionLayer,

            my.vfx.movement,
            my.vfx.doubleJump,
            my.vfx.explosion,
            my.vfx.coinCollect,
            my.vfx.enemyPoof,

            my.sprite.player]);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // Oliver - set up WASD and Space as alternative controls
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1, 5, 5);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);


    }

    update() {
        if(this.levelEnd){
            return;
        }
        if(cursors.left.isDown || this.wasd.left.isDown) {
            // let accel = my.sprite.player.body.velocity.x > 0 ? this.TURN_ACCELERATION : this.ACCELERATION;
            // TODO: have the player accelerate to the left
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.body.setDragX(-this.DRAG);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.movement.startFollow(my.sprite.player, -my.sprite.player.displayWidth / 2 + 20, my.sprite.player.displayHeight / 2, false);
            my.vfx.movement.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if(my.sprite.player.body.blocked.down){
                my.vfx.movement.start();
            }

        } else if(cursors.right.isDown || this.wasd.right.isDown) {
            // let accel = my.sprite.player.body.velocity.x > 0 ? this.TURN_ACCELERATION : this.ACCELERATION;

            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.movement.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 20, my.sprite.player.displayHeight / 2, false);
            my.vfx.movement.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if(my.sprite.player.body.blocked.down){
                my.vfx.movement.start();
            }

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle'); 
            my.vfx.movement.stop();
        }

        // Oliver - Fixed Double Jump pt.2
        if(my.sprite.player.body.blocked.down){
            this.hasDoubleJumped = false;
        } else {
            my.sprite.player.anims.play('jump');
            my.vfx.movement.stop();
        }

        if(Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up) || Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if(my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.hasDoubleJumped = false;
                this.jump_sfx.play();
            } else if(!this.hasDoubleJumped) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.hasDoubleJumped = true;
                this.jump_sfx.play();
                my.vfx.movement.stop();
                my.vfx.doubleJump.explode(10, my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight / 2);
            }
        }

        // enemy edge detection
        this.enemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){
                return;
            }
            enemy.play('enemy_walk', true);

            if(enemy.body.blocked.left){
                enemy.body.setVelocityX(50);
                enemy.setFlipX(true);
            } else if (enemy.body.blocked.right){
                enemy.body.setVelocityX(-50);
                enemy.resetFlip();
            }
        });

        this.unkillableEnemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){
                return;
            } 

            enemy.play('unkillable_enemy_walk', true);

            if(enemy.body.blocked.left){
                enemy.body.setVelocityX(50);
                enemy.setFlipX(true);
            } else if (enemy.body.blocked.right){
                enemy.body.setVelocityX(-50);
                enemy.resetFlip();
            }
        });

        this.flyingEnemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){
                return;
            }

            enemy.play('enemy_fly', true);

            if (this.enemyOnScreen(enemy)){
                this.physics.moveToObject(enemy, my.sprite.player, 50);
            } else {
                enemy.body.setVelocity(0, 0);
            }
        });
    }

    showRemainingDiamondsText(flag){
        if (this.showNeedDiamondsText){
            return;
        }

        this.showNeedDiamondsText = true;

        let warningText = this.add.text(flag.x - 70, flag.y - 30, "You need all 6 diamonds!", { fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setDepth(10).setAlpha(0);

        this.uiCamera.ignore(warningText);

        this.tweens.add({
            targets: warningText,
            alpha: 1,
            y: flag.y - 40,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                this.tweens.add({
                    targets: warningText,
                    alpha: 0,
                    duration: 500,
                    ease: 'linear',
                    onComplete: () => {
                        warningText.destroy();
                        this.showNeedDiamondsText = false;
                    }
                }); 
            }
        });
    }

    startlevelEnd(player){
        this.levelEnd = true;

        this.cameras.main.stopFollow();
        player.setCollideWorldBounds(false);

        player.body.setDragX(0);
        player.setVelocityX(120);
        player.anims.play('walk', true);
        player.setFlip(true, false);

        // Oliver - Unlock next level when completed
        if(selectedLevel >= levelsUnlocked){
            levelsUnlocked = selectedLevel + 1;
        }

        this.time.delayedCall(3000, () => {
            player.body.setVelocityX(0);
            player.anims.play('idle', true);
            this.showEndScreen();
        });
    }

    showEndScreen() {
        if (this.finalScoreText) {
            return;
        }

        this.finalScoreText = true;

        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;

        let panel = this.add.rectangle(centerX, centerY, 360, 260, 0x000000, 0.75).setScrollFactor(0).setDepth(200);

        let completeText = this.add.text(centerX, centerY - 90, "Level Complete!", {fontSize: '28px', color: '#ffffff', stroke: '#000000', strokeThickness: 4}).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        let finalScoreText = this.add.text(centerX, centerY - 35, "Score: 0000", {fontSize: '22px',color: '#ffffff',stroke: '#000000',strokeThickness: 4}).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        let restartButton = this.add.text(centerX, centerY + 35, "Restart", {fontSize: '20px',color: '#ffffff',backgroundColor: '#333333',padding: {x: 16,y: 8}}).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();

        let menuButton = this.add.text(centerX, centerY + 90, "Main Menu", {fontSize: '20px',color: '#ffffff',backgroundColor: '#333333',padding: {x: 16,y: 8}}).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });

        menuButton.on('pointerdown', () => {
            this.scene.start("startScene");
        });

        let endUI = [panel, completeText, finalScoreText, restartButton, menuButton];

        this.cameras.main.ignore(endUI);

        let displayedScore = 0;

        this.tweens.addCounter({
            from: 0,
            to: this.score,
            duration: 1500,
            ease: 'Linear',
            onUpdate: (tween) => {
                displayedScore = Math.floor(tween.getValue());
                finalScoreText.setText("Score: " + String(displayedScore).padStart(4, "0"));
            }
        });
    }

    enemyOnScreen(enemy){
        let camera = this.cameras.main;
        let view = camera.worldView;

        return Phaser.Geom.Rectangle.Overlaps(view, enemy.getBounds());
    };

    startFallingPlatforms(tile){
        let tileData = {
            x: tile.x, 
            y: tile.y, 
            index: tile.index, 
            properties: tile.properties
        };

        this.fallenPlatformTiles.push(tileData);

        let frame = tile.index;

        if (tile.tileset) {
            frame = tile.index - tile.tileset.firstgid;
        }

        let platform = this.physics.add.sprite(
            tile.getCenterX(),
            tile.getCenterY(),
            "tilemap_sheet",
            frame
        );

        platform.setOrigin(0.5);
        platform.body.setAllowGravity(false);
        platform.body.setImmovable(true);
        platform.body.setVelocity(0, 0);

        this.fallingPlatformSprites.add(platform);


        this.fallingPlatforms.removeTileAt(tile.x, tile.y);

        if (this.uiCamera) {
            this.uiCamera.ignore(platform);
        }

        let originalX = platform.x;
        let originalY = platform.y;

        this.tweens.add({
            targets: platform,
            x: {from: originalX - 4, to: originalX + 4},
            duration: 40,
            yoyo: true,
            repeat: 5,
            ease: "Linear",
            onComplete: () => {
                platform.x = originalX;
                platform.y = originalY;

                this.time.delayedCall(100, () => {
                    if(!platform || !platform.active){
                        return;
                    }
                        platform.body.setImmovable(false);
                        platform.body.setAllowGravity(true);
                        platform.body.setGravityY(-2200);
                        platform.body.setVelocityY(20);
                        platform.body.setMaxVelocityY(100);

                        this.time.delayedCall(3000, () => {
                            if (platform && platform.active) {
                                platform.destroy();
                            }
                        });
                });
            }
        });
    }

    resetFallingPlatforms() {
        this.fallenPlatformTiles.forEach(tileData => {
            let restoredTile = this.fallingPlatforms.putTileAt(
                tileData.index,
                tileData.x,
                tileData.y
            );

            if (restoredTile) {
                restoredTile.properties = tileData.properties;

                if (restoredTile.properties.oneway === true) {
                    restoredTile.setCollision(false, false, true, false);
                } else {
                    restoredTile.setCollision(true, true, true, true);
                }
            }
        });

        this.fallenPlatformTiles = [];
        this.triggeredFallingTiles.clear();

        this.fallingPlatformSprites.children.iterate(platform => {
            if (platform) {
                platform.destroy();
            }
        });
    }

    respawnPlayer(player){
        this.resetFallingPlatforms();
        player.body.setVelocity(0,0);
        player.body.setAcceleration(0,0);
        player.setPosition(this.spawnX, this.spawnY);
        player.body.setVelocity(0,0);
        player.body.setAcceleration(0,0);
    }
}