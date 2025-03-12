define(require => {
    const BaseGamePoint = require('game/components/baseGame/BaseGamePoint');
    const gameConfig = require('skbJet/componentManchester/standardIW/gameConfig');

    class LuckyNumber extends BaseGamePoint {
        constructor(index, specialEffects) {
            super(index, specialEffects);

            this.index = index;

            this.autoRevealOnStart = gameConfig.autoRevealOnStart || false;

            this.type = "LuckyStar";
            this.starPos = this.index;
        }

        static fromContainer(container, index, effectContainer) {
            const symbol = new LuckyNumber(index, effectContainer);
            container.addChild(symbol);
            return symbol;
        }

    }

    return LuckyNumber;

});