class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create() {
        const centerX = this.cameras.main.width / 2;

        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xc8eaf5).setOrigin(0);

        this.add.text(centerX, 110, "Credits", {
            fontSize: "42px", color: "#ffffff", stroke: "#000000", strokeThickness: 6
        }).setOrigin(0.5).setScale(2);

        const creditLines = [
            { label: "Developers", value: "Kieran Chu & Oliver Stephenson" },
            { label: "Art Assets", value: "Kenney Assets — Pixel Platformer Pack" },
            { label: "Game Engine", value: "Phaser 3" },
            { label: "Course", value: "CMPM 120 - Game Development, UCSC" },
        ];

        creditLines.forEach((line, i) => {
            const y = 280 + i * 95;

            this.add.text(centerX, y, line.label, {
                fontSize: "18px", color: "#aaddff", stroke: "#000000", strokeThickness: 3
            }).setOrigin(0.5);

            this.add.text(centerX, y + 36, line.value, {
                fontSize: "22px", color: "#ffffff", stroke: "#000000", strokeThickness: 3
            }).setOrigin(0.5);
        });

        const backButton = this.add.text(centerX, 655, "Back", {
            fontSize: "22px", color: "#ffffff", backgroundColor: "#333333", padding: {x: 20, y: 10}
        }).setOrigin(0.5).setInteractive();

        backButton.on("pointerdown", () => { this.scene.start("startScene"); });
        backButton.on("pointerover", () => { backButton.setScale(1.1); });
        backButton.on("pointerout", () => { backButton.setScale(1); });
    }
}