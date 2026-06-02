class LevelSelect extends Phaser.Scene {
    constructor() {
        super("levelSelectScene");
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xc8eaf5).setOrigin(0);

        this.add.text(centerX, 110, "Select Level", {
            fontSize: "42px", color: "#ffffff", stroke: "#000000", strokeThickness: 6
        }).setOrigin(0.5).setDepth(10).setScale(2);

        const levels = [
            {num: 1, label: "Level 1", sub: "The Hunt"},
            {num: 2, label: "Level 2", sub: "Industrial Chaos"},
            {num: 3, label: "Level 3", sub: "Sweet Finale"},
        ];

        levels.forEach((lvl, i) => {
            const x = centerX + (i - 1) * 370;
            const y = centerY + 30;
            const isUnlocked = lvl.num <= levelsUnlocked;

            // Card background — grayed out if locked
            this.add.rectangle(x, y, 300, 220, 0x000000, isUnlocked ? 0.65 : 0.35).setDepth(9);

            this.add.text(x, y - 65, lvl.label, {
                fontSize: "24px",
                color: isUnlocked ? "#ffffff" : "#777777",
                stroke: "#000000", strokeThickness: 4
            }).setOrigin(0.5).setDepth(10);

            this.add.text(x, y - 25, lvl.sub, {
                fontSize: "16px",
                color: isUnlocked ? "#aaaaaa" : "#555555",
                stroke: "#000000", strokeThickness: 2
            }).setOrigin(0.5).setDepth(10);

            if(isUnlocked){
                this.add.image(x, y + 20, 'tilemap_sheet', 67).setScale(3).setDepth(10);
            } else {
                this.add.text(x, y + 10, "Locked", {
                    fontSize: "32px"
                }).setOrigin(0.5).setDepth(10);

                this.add.text(x, y + 55, "Complete previous\nlevel to unlock", {
                    fontSize: "13px", color: "#777777", align: "center"
                }).setOrigin(0.5).setDepth(10);
            }

            if(isUnlocked){
                const playBtn = this.add.text(x, y + 75, "Play", {
                    fontSize: "22px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 20, y: 10}
                }).setOrigin(0.5).setDepth(10).setInteractive();

                playBtn.on("pointerdown", () => {
                    selectedLevel = lvl.num;
                    this.scene.start("loadScene");
                });
                playBtn.on("pointerover", () => { playBtn.setScale(1.1); });
                playBtn.on("pointerout",  () => { playBtn.setScale(1); });
            }
        });

        const backButton = this.add.text(centerX, centerY + 245, "Back", {
            fontSize: "22px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 20, y: 10}
        }).setOrigin(0.5).setDepth(10).setInteractive();

        backButton.on("pointerdown", () => { this.scene.start("startScene"); });
        backButton.on("pointerover", () => { backButton.setScale(1.1); });
        backButton.on("pointerout",  () => { backButton.setScale(1); });
    }
}