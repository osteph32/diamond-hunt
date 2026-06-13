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
        this.hasDoubleJumped = false;
        this.score = 0;
        this.diamondsLeft = 6;
        this.levelEnd = false;
        this.showNeedDiamondsText = false;
        this.finalScoreText = false;
        this.isSliding = false;
        this.isDashing = false;
        this.dashCooldown = false;
        this.lastLeftTap = 0;
        this.lastRightTap = 0;
        this.DASH_TAP_WINDOW = 250;
        this.DASH_VELOCITY = 520;
        this.DASH_DURATION = 180;
        this.DASH_COOLDOWN = 700; 
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("stage-" + selectedLevel);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 5000);
        this.physics.world.checkCollision.up = false;

        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.bgTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");
        this.industrialTileset = this.map.addTilesetImage("pixel_platformer_industrial_tilemap_packed", "industrial_tiles");
        this.bgPinkTileset = this.map.addTilesetImage("tilemap-backgrounds_pink", "backgrounds_pink_tiles");
        this.foodTileset = this.map.addTilesetImage("tilemap_packed_food", "food_tiles");
        this.packedTileset = this.map.addTilesetImage("tilemap_packed", "tilemap_packed_tiles");

        const bgTilesets = [this.bgTileset, this.bgPinkTileset].filter(Boolean);
        const groundTilesets = [this.tileset, this.industrialTileset, this.foodTileset, this.packedTileset].filter(Boolean);
        const collTilesets = [this.tileset, this.packedTileset].filter(Boolean);

        this.skyLayer = this.map.createLayer("Sky", bgTilesets, 0, 0);

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", groundTilesets, 0, 0);

        this.waterLayer = this.map.createLayer("Water-n-Spikes", groundTilesets, 0, 0);
        
        this.fallingPlatforms = this.map.createLayer("falling-platforms", groundTilesets, 0, 0);

        this.aesthetics = this.map.createLayer("aesthetics", groundTilesets, 0, 0);

        this.enemyCollisionLayer = this.map.createLayer("Enemy-Collision", collTilesets, 0, 0);

        this.dash_sfx = this.sound.add('dash_sfx', { volume: 0.5, loop: false });
        
        this.platform_appear_sfx = this.sound.add('platform_appear_sfx', { volume: 0.5, loop: false });

        if(this.sys.animatedTiles) this.sys.animatedTiles.init(this.map);

        this.waterLayer.setCollisionByProperty({
            hazard: true
        });

        this.groundLayer.setCollisionByProperty({ collides: true });
        if (this.groundLayer.filterTiles(t => t.collides).length === 0) {
            this.groundLayer.setCollisionByExclusion([-1]);
        }

        this.groundLayer.forEachTile(tile => {
            if (tile.properties && tile.properties.oneway === true){
                tile.setCollision(false, false, true, false);
            }
        });

        this.fallingPlatforms.setCollisionByProperty({ collides: true });
        if (this.fallingPlatforms.filterTiles(t => t.collides).length === 0) {
            this.fallingPlatforms.setCollisionByExclusion([-1]);
        }

        this.fallingPlatforms.forEachTile(tile => {
            if (tile.properties && tile.properties.oneway === true){
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

        const safeCreate = (layerName, config) => {
            if (!this.map.getObjectLayer(layerName)) return [];
            return this.map.createFromObjects(layerName, config);
        };

        this.unkillableEnemies = safeCreate("Unkillable_Enemies", {
            name: "unkillable_enemies",
            key: "tilemap_characters",
            frame: 16
        });

        this.flyingEnemies = safeCreate("Flying_Enemies", {
            name: "flying_enemies",
            key: "tilemap_characters",
            frame: 24
        });

        this.enemies = safeCreate("Enemies", {
            name: "enemies",
            key: "tilemap_characters",
            frame: 18
        });

        this.mines = safeCreate("Mines", {
            name: "mines",
            key: "tilemap_characters",
            frame: 8
        });

        this.crusherEnemies = safeCreate("Crusher_Enemies", {
            name: "crusher_enemies",
            key: "tilemap_characters",
            frame: 11
        });

        this.flying3 = safeCreate("Flying_3", {
            name: "Flying_3",
            key: "tilemap_characters",
            frame: 24
        });

        this.scissorEnemies = safeCreate("Scissor_Enemies", {
            name: "Scissor_Enemies",
            key: "tilemap_characters",
            frame: 18
        });
        this.scissorEnemies.forEach(s => s.setFrame(18));

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

        if (this.unkillableEnemies.length) this.physics.world.enable(this.unkillableEnemies);
        if (this.flyingEnemies.length) this.physics.world.enable(this.flyingEnemies);
        if (this.enemies.length) this.physics.world.enable(this.enemies);
        if (this.mines.length) this.physics.world.enable(this.mines);
        if (this.crusherEnemies.length) this.physics.world.enable(this.crusherEnemies);
        if (this.flying3.length) this.physics.world.enable(this.flying3);
        if (this.scissorEnemies.length) this.physics.world.enable(this.scissorEnemies);

        this.checkpointFlagGroup = this.add.group(this.checkpointFlags);
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
        this.crusherEnemyGroup = this.add.group(this.crusherEnemies);
        this.flying3Group = this.add.group(this.flying3);
        this.scissorEnemyGroup = this.add.group(this.scissorEnemies);

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

        this.crusherEnemyGroup.children.iterate(enemy => {
            enemy.body.setAllowGravity(false);
        });

        this.flying3Group.children.iterate(enemy => {
            enemy.body.setAllowGravity(false);
        });

        this.scissorEnemyGroup.children.iterate(enemy => {
            enemy.body.setAllowGravity(true);
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

        // Level 2 setup
        if(selectedLevel === 2){
            this.setupLevel2(groundTilesets);
            this.setupLevel2Enemies();
        }

        if(selectedLevel === 3){
            this.setupLevel3Enemies();
        }


        // Falling platforms 
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

        if(selectedLevel === 3){
            this.setupLevel3Enemies();
        }

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
            this.appearingPlatforms,
            this.aesthetics, 
            this.aesthetics2,
            this.aesthetics3,

            this.coinGroup, 
            this.diamondGroup, 
            this.checkpointFlagGroup, 
            this.checkpointPoleGroup, 
            this.endFlagGroup, 
            this.endPoleGroup, 
            this.button,

            this.unkillableEnemyGroup,
            this.flyingEnemyGroup,
            this.enemyGroup,
            this.mineGroup,
            this.crusherEnemyGroup,
            this.flying3Group,
            this.scissorEnemyGroup,
            this.enemyCollisionLayer,

            my.vfx.movement,
            my.vfx.doubleJump,
            my.vfx.explosion,
            my.vfx.coinCollect,
            my.vfx.enemyPoof,

            my.sprite.player].filter(Boolean));

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // Oliver - set up WASD and Space as alternative controls
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        };
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1, 5, 5);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        if(selectedLevel === 1){
            gameStartTime = Date.now();
        }
    }

    update() {
        if(this.levelEnd){ 
            return; 
        }

        // Void death
        if(my.sprite.player.y > this.map.heightInPixels + 50){
            this.player_hit_sfx.play();
            this.respawnPlayer(my.sprite.player);
        }

        const onGround = my.sprite.player.body.blocked.down;
        const slideKeyHeld = cursors.down.isDown || this.wasd.down.isDown;
        const atFullSpeed = Math.abs(my.sprite.player.body.velocity.x) >= this.MAX_SPEED - 20;

        const leftJustDown  = Phaser.Input.Keyboard.JustDown(cursors.left)  || Phaser.Input.Keyboard.JustDown(this.wasd.left);
        const rightJustDown = Phaser.Input.Keyboard.JustDown(cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.right);

        // Kieran - Dash mechanic: Double tap direction key
        if(hasDash && !this.isDashing && !this.dashCooldown && !this.isSliding){
            if(Phaser.Input.Keyboard.JustDown(this.fKey)){
                const direction = my.sprite.player.flipX ? 1 : -1;
                this.startDash(direction);
            }
        }

        if(this.isDashing){
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(0);
            my.sprite.player.anims.play('walk', true);
            my.vfx.movement.stop();
            
        } else {
            // Oliver - Slide mechanic: start slide hold S/down
            if(hasSlide && !this.isSliding && slideKeyHeld && atFullSpeed && onGround){
                this.isSliding = true;
                this.slideDirection = Math.sign(my.sprite.player.body.velocity.x);
                my.sprite.player.body.setSize(22, 8);
                my.sprite.player.body.setOffset(0, 14);
            }

            const slideStopped = Math.abs(my.sprite.player.body.velocity.x) < 10;
            if(this.isSliding && (!slideKeyHeld || !onGround || slideStopped)){
                this.isSliding = false;
                my.sprite.player.body.setSize(22, 22);
                my.sprite.player.body.setOffset(0, 0);
            }

            if(this.isSliding){
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(80);
                my.sprite.player.anims.play('idle', true);
                my.vfx.movement.stop();

            } else {
                if(cursors.left.isDown || this.wasd.left.isDown) {
                    my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                    my.sprite.player.body.setDragX(-this.DRAG);
                    my.sprite.player.resetFlip();
                    my.sprite.player.anims.play('walk', true);
                    my.vfx.movement.startFollow(my.sprite.player, -my.sprite.player.displayWidth / 2 + 20, my.sprite.player.displayHeight / 2, false);
                    my.vfx.movement.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                    if(onGround){ my.vfx.movement.start(); }

                } else if(cursors.right.isDown || this.wasd.right.isDown) {
                    my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                    my.sprite.player.body.setDragX(this.DRAG);
                    my.sprite.player.setFlip(true, false);
                    my.sprite.player.anims.play('walk', true);
                    my.vfx.movement.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 20, my.sprite.player.displayHeight / 2, false);
                    my.vfx.movement.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                    if(onGround){ my.vfx.movement.start(); }

                } else {
                    my.sprite.player.body.setAccelerationX(0);
                    my.sprite.player.body.setDragX(this.DRAG);
                    my.sprite.player.anims.play('idle');
                    my.vfx.movement.stop();
                }

                // Oliver - Fixed Double Jump
                if(onGround){
                    this.hasDoubleJumped = false;
                } else {
                    my.sprite.player.anims.play('jump');
                    my.vfx.movement.stop();
                } 

                // Jump and double jump — disabled while sliding
                if(Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up) || Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
                    if(onGround) {
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
            }
        }

        this.enemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){ return;}
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
            if(!enemy || !enemy.body){ return; }
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
            if(!enemy || !enemy.body){ return; }
            enemy.play('enemy_fly', true);
            if(this.enemyOnScreen(enemy)){
                this.physics.moveToObject(enemy, my.sprite.player, 50);
            } else {
                enemy.body.setVelocity(0, 0);
            }
        });

        if(selectedLevel === 2){
            this.updateLevel2Enemies();
        }

        //
        if(selectedLevel === 3){
            this.updateLevel3Enemies();
        }
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

    startDash(direction) {
        this.isDashing = true;
        this.dash_sfx.play();

        if(direction < 0){
            my.sprite.player.resetFlip();
        } else {
            my.sprite.player.setFlip(true, false);
        }
        
        my.sprite.player.body.setAllowGravity(false);
        my.sprite.player.body.setVelocityY(0);
        my.sprite.player.body.setMaxVelocityX(this.DASH_VELOCITY);
        my.sprite.player.body.setVelocityX(this.DASH_VELOCITY * direction);
        my.sprite.player.body.setAccelerationX(0);
        my.sprite.player.body.setDragX(0);

        my.vfx.doubleJump.explode(15, my.sprite.player.x, my.sprite.player.y);

        this.time.delayedCall(this.DASH_DURATION, () => {
            this.isDashing = false;
            this.dashCooldown = true;

            my.sprite.player.body.setAllowGravity(true);
            my.sprite.player.body.setMaxVelocityX(this.MAX_SPEED);

            this.time.delayedCall(this.DASH_COOLDOWN, () => {
                this.dashCooldown = false;
            });
        });
    }

    startlevelEnd(player){
        this.levelEnd = true;

        if(selectedLevel >= levelsUnlocked){
            levelsUnlocked = selectedLevel + 1;
        }

        if(selectedLevel === 1){
            hasDash = true;
        }

        if(selectedLevel === 2){
            hasSlide = true;
        }

        this.cameras.main.stopFollow();
        player.setCollideWorldBounds(false);

        player.body.setDragX(0);
        player.setVelocityX(120);
        player.anims.play('walk', true);
        player.setFlip(true, false);

        this.time.delayedCall(3000, () => {
            player.body.setVelocityX(0);
            player.anims.play('idle', true);
            this.showEndScreen();
        });
    }

    showEndScreen() {
        if(this.finalScoreText){ return; }
        this.finalScoreText = true;

        const totalSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;

        let panel = this.add.rectangle(centerX, centerY, 360, 300, 0x000000, 0.75)
            .setScrollFactor(0).setDepth(200);

        let completeText = this.add.text(centerX, centerY - 110, "You've hunted all the diamonds!", {
            fontSize: '18px', color: '#ffe040', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        let finalScoreText = this.add.text(centerX, centerY - 55, "Score: 0000", {
            fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        let timerText = this.add.text(centerX, centerY - 15, "Time: " + timeString, {
            fontSize: '20px', color: '#aaddff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        let restartButton = this.add.text(centerX, centerY + 55, "Restart", {
            fontSize: '20px', color: '#ffffff', padding: {x: 16, y: 8}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();

         let nextLevelButton = this.add.text(centerX, centerY + 82.5, "Next Level", {
            fontSize: '20px', color: '#ffffff', padding: {x: 16, y: 8}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
        if (selectedLevel >= 3){
            nextLevelButton.setVisible(false).disableInteractive();
        }

        let menuButton = this.add.text(centerX, centerY + 110, "Main Menu", {
            fontSize: '20px', color: '#ffffff', padding: {x: 16, y: 8}
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();

        restartButton.on('pointerdown', () => {
            gameStartTime = Date.now();
            this.scene.start("loadScene");
        });

        restartButton.on('pointerover', () => { restartButton.setScale(1.1); });
        restartButton.on('pointerout',  () => { restartButton.setScale(1); });

        nextLevelButton.on('pointerdown', () => {
            selectedLevel++;
            gameStartTime = Date.now();
            if(selectedLevel === 2){
                this.scene.start("cutscene1_2Scene");
            }
            else if(selectedLevel === 3){
                this.scene.start("cutscene2_3Scene");
            }
        });
        nextLevelButton.on('pointerover', () => { nextLevelButton.setScale(1.1); });
        nextLevelButton.on('pointerout',  () => { nextLevelButton.setScale(1); });

        menuButton.on('pointerdown', () => { this.scene.start("startScene"); });
        menuButton.on('pointerover', () => { menuButton.setScale(1.1); });
        menuButton.on('pointerout',  () => { menuButton.setScale(1); });

        let endUI = [panel, completeText, finalScoreText, timerText, restartButton, nextLevelButton, menuButton];
        this.cameras.main.ignore(endUI);

        this.tweens.addCounter({
            from: 0,
            to: this.score,
            duration: 1500,
            ease: 'Linear',
            onUpdate: (tween) => {
                finalScoreText.setText("Score: " + String(Math.floor(tween.getValue())).padStart(4, "0"));
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

    // Level 2 Helpers
    setupLevel2(groundTilesets){
        this.aesthetics2 = this.map.createLayer("aesthetics2", groundTilesets, 0, 0);

        this.aesthetics3 = this.map.createLayer("aesthetics3", groundTilesets, 0, 0);

        this.appearingPlatforms = this.map.createLayer("appearing-platforms", groundTilesets, 0, 0);
        this.appearingPlatforms.setCollisionByProperty({ collides: true });
            if (this.appearingPlatforms.filterTiles(t => t.collides).length === 0) {
                this.appearingPlatforms.setCollisionByExclusion([-1]);
            }

        this.appearingPlatforms.forEachTile(tile => {
            if (tile.properties && tile.properties.oneway === true){
                    tile.setCollision(false, false, true, false);
            }
        });

        this.appearingCollider = this.physics.add.collider(my.sprite.player, this.appearingPlatforms);
        this.appearingPlatforms.setVisible(false);
        this.appearingCollider.active = false;
        this.appearingActive = false;

        this.button = this.map.createFromObjects("Button",{
            name: "button",
            key: "tilemap_sheet",
            frame: 148
        });

        this.physics.world.enable(this.button, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(my.sprite.player, this.button, (player, button) => {
            if(this.appearingActive){
                return;
            }
            
            this.activeButton = button;
            button.setFrame(149);
            this.activateAppearingPlatforms();
        }, null, this);

    }

    activateAppearingPlatforms(){
        const UPTIME = 10000;
        const WARN_TIME = 3000;
        
        this.appearingActive = true;
        this.platform_appear_sfx.play();

        if(this.appearingBlink){
            this.appearingBlink.stop();
            this.appearingBlink = null;
        }
        this.appearingPlatforms.setAlpha(1);

        this.appearingPlatforms.setVisible(true);
        this.appearingCollider.active = true;

        this.warnTimer = this.time.delayedCall(UPTIME - WARN_TIME, () => {
            this.appearingBlink = this.tweens.add({
                targets: this.appearingPlatforms,
                alpha: 0.2,
                duration: 180, 
                yoyo: true, 
                repeat: -1, 
                ease: "Linear"
            });
        });

        this.time.delayedCall(UPTIME, () => {
            if(this.appearingBlink){
                this.appearingBlink.stop();
                this.appearingBlink = null;
                this.platform_appear_sfx.stop();
            }
            this.tweens.killTweensOf(this.appearingPlatforms);
            this.appearingPlatforms.setAlpha(1);
            this.appearingPlatforms.setVisible(false);
            this.appearingCollider.active = false;
            this.appearingActive = false;
            this.activeButton.setFrame(148);
        });
    }

    setupLevel2Enemies(){
        this.crusherEnemyGroup.children.iterate(enemy => {
            enemy.startY = enemy.y;
            enemy.enemyState = "idle";
        });

        this.physics.add.collider(this.crusherEnemyGroup, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, this.crusherEnemyGroup, (player, enemy) => {
            this.respawnPlayer(player);
            this.player_hit_sfx.play();
            player.body.setVelocity(0, 0);
        });
    }

    updateLevel2Enemies(){
        const player = my.sprite.player;
        const DROP_SPEED = 500;
        const TRIGGER_WIDTH = 16;
        const RISE_DURATION = 800;

        this.crusherEnemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){ return; }

            switch(enemy.enemyState){
                case "idle": {
                    const dx = Math.abs(player.body.center.x - enemy.body.center.x);
                    const playerBelow = player.body.center.y > enemy.body.center.y;
                    if(dx < TRIGGER_WIDTH && playerBelow){
                        enemy.enemyState = "warning";
                        enemy.setFrame(12);

                        this.tweens.add({
                            targets: enemy,
                            x: {from: enemy.x - 4, to: enemy.x + 4},
                            duration: 35,
                            yoyo: true,
                            repeat: 5,
                            ease: "Linear",
                            onComplete: () => {
                                if(enemy.active && enemy.enemyState === "warning"){
                                    enemy.enemyState = "dropping";
                                    enemy.body.setVelocityY(DROP_SPEED);
                                }
                            }
                        });
                    }
                    break;
                }

                case "dropping": {
                    if(enemy.body.blocked.down){
                        enemy.body.setVelocityY(0);
                        enemy.enemyState = "grounded";
                        this.time.delayedCall(2000, () => {
                            if(enemy.active && enemy.enemyState === "grounded"){
                                enemy.enemyState = "rising";
                                this.tweens.add({
                                    targets: enemy,
                                    y: enemy.startY,
                                    duration: RISE_DURATION,
                                    ease: "Sine.easeInOut",
                                    onComplete: () => {
                                        enemy.enemyState = "idle";
                                        enemy.setFrame(11);
                                    }
                                });
                            }
                        });
                    }
                    break;
                }
            }
        });
    }

    resetCrushers(){
        if(!this.crusherEnemyGroup){ return; }
        this.crusherEnemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){ return; }
            this.tweens.killTweensOf(enemy);
            enemy.body.setVelocityY(0);
            enemy.y = enemy.startY;
            enemy.enemyState = "idle";
        });
    }

    // Level 3 Helpers
    setupLevel3Enemies() {
        this.flying3Group.children.iterate(enemy => {
            enemy.startY = enemy.y;
            enemy.body.setVelocityY(-45);
        });

        this.scissorEnemyGroup.children.iterate(enemy => {
            enemy.body.setVelocityX(40);
        });
        this.physics.add.collider(this.scissorEnemyGroup, this.groundLayer);
        this.physics.add.collider(this.scissorEnemyGroup, this.fallingPlatforms);

        this.physics.add.overlap(my.sprite.player, this.flying3Group, (player, enemy) => {
            if(player.body.velocity.y > 0 && player.y < enemy.y){
                enemy.destroy();
                my.vfx.enemyPoof.explode(10, enemy.x, enemy.y);
                this.enemy_kill_sfx.play();
                player.body.setVelocityY(this.JUMP_VELOCITY / 1.5);
                this.score += 150;
                this.scoreText.setText(String(this.score).padStart(4, "0"));
            } else {
                this.respawnPlayer(player);
                this.player_hit_sfx.play();
                player.body.setVelocity(0, 0);
            }
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.scissorEnemyGroup, (player, enemy) => {
            if(this.isSliding){
                enemy.destroy();
                my.vfx.enemyPoof.explode(10, enemy.x, enemy.y);
                this.enemy_kill_sfx.play();
                this.score += 200;
                this.scoreText.setText(String(this.score).padStart(4, "0"));
            } else {
                this.player_hit_sfx.play();
                this.respawnPlayer(player);
                player.body.setVelocity(0, 0);
            }
        }, null, this);
    }

    updateLevel3Enemies() {
        this.flying3Group.children.iterate(enemy => {
            if(!enemy || !enemy.body){ return; }
            enemy.play('enemy_fly', true);
            const patrolRange = 18 * 4.5; // ~4.5 tiles
            if(enemy.y <= enemy.startY - patrolRange){
                enemy.body.setVelocityY(45);
            } else if(enemy.y >= enemy.startY + patrolRange){
                enemy.body.setVelocityY(-45);
            }
        });

        this.scissorEnemyGroup.children.iterate(enemy => {
            if(!enemy || !enemy.body){ return; }
            enemy.play('scissor_walk', true);

            if(enemy.body.blocked.left){
                enemy.body.setVelocityX(40);
                enemy.setFlipX(true);
            } else if(enemy.body.blocked.right){
                enemy.body.setVelocityX(-40);
                enemy.resetFlip();
            }

            const dir = enemy.body.velocity.x > 0 ? 1 : -1;
            const edgeCheckX = enemy.x + dir * (enemy.width / 2 + 2);
            const edgeCheckY = enemy.y + enemy.height / 2 + 4;
            const tileBelow = this.groundLayer.getTileAtWorldXY(edgeCheckX, edgeCheckY);
            if(!tileBelow && enemy.body.blocked.down){
                enemy.body.setVelocityX(-enemy.body.velocity.x);
                if(dir > 0){ enemy.resetFlip(); } else { enemy.setFlipX(true); }
            }
        });
    }

    respawnPlayer(player){
        this.resetFallingPlatforms();
        if(selectedLevel === 2){
            this.resetCrushers();
        }
        player.body.setVelocity(0,0);
        player.body.setAcceleration(0,0);
        player.setPosition(this.spawnX, this.spawnY);
        player.body.setVelocity(0,0);
        player.body.setAcceleration(0,0);
    }
}