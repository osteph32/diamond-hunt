"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1350,
    height: 725,
    plugins: {
        scene: [
            {
                key: 'AnimatedTiles',
                plugin: typeof AnimatedTiles !== 'undefined' ? AnimatedTiles : null,
                mapping: 'animatedTiles'
            }
        ].filter(p => p.plugin !== null)
    },
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Start, Load, LevelSelect, Credits, Platformer]
};

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}};
var selectedLevel = 1;
var levelsUnlocked = 1;  // tracks played levels
var hasSlide = true;
var hasDash = true;
var gameStartTime = 0;

const game = new Phaser.Game(config);