define(require => {
    const PIXI = require('com/pixijs/pixi');
    const resLib = require('skbJet/component/resourceLoader/resourceLib');
    const orientation = require('skbJet/componentManchester/standardIW/orientation');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');

    class BonusRow extends PIXI.Container {
        constructor(index) {
            super();
            this.spine = new PIXI.spine.Spine(resLib.spine['megaMatchLayout'].spineData);
            this.index = index;
            this.renderable = false;

            this.addChild(this.spine);
            msgBus.subscribe('GameSize.OrientationChange', this.onOrientationChange.bind(this));
        }

        playWinningRowAnim() {
            let anim = orientation.get() === orientation.LANDSCAPE ?
                'landscape animations/winLine0' + this.index + 'Landscape' :
                'portrait animations/winLine0' + this.index + 'Portrait';
            this.spine.state.setAnimation(0, anim, true);
            this.renderable = true;
            //TODO : add check to see if already playing and adjust current frame to match on orientation Change
        }

        onOrientationChange() {
            let anim = orientation.get() === orientation.LANDSCAPE ?
                'landscape animations/winLine0' + this.index + 'Landscape' :
                'portrait animations/winLine0' + this.index + 'Portrait';
            this.spine.state.setAnimation(0, anim, true);
        }

        reset() {
            this.renderable = false;
        }

        static fromContainer(container, index) {
            const row = new BonusRow(index);
            container.addChild(row);
            return row;
        }
    }

    return BonusRow;

});