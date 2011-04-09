Ext.override(Ext.util.ComponentDragger, {
    onStart: function(e) {
        this.callOverridden(arguments);
        this.comp.fireEvent("ghost", this.comp);
    },
    onEnd: function(e) {
        this.callOverridden(arguments);
        this.comp.fireEvent("unghost", this.comp);
    }
});

Ext.define('Ext.plugin.extjs.WindowDrawers', {
	extend : 'Ext.window.Window',
	alias  : 'plugin.windowdrawer',

	offset : 10,

	initComponent: function() {
		var me     = this,
			parent = me.cmp;

		Ext.apply(me, {
			closeAction : 'hide',
			isShown   : false,
			closable  : false,
			resizable : false,
			draggable : false
		});

		me.callParent(arguments);
	},

	init: function(win) {
		var me = this;

		win.drawers = win.drawers || {};

		win.drawers[me.side] = me;

		win.on({
            scope   : me,
            resize  : me.onWinResize,
            move    : me.onWinResize,
            ghost   : Ext.bind(me.onWinStartDrag, me, ['hide']),
            unghost : Ext.bind(me.onWinStartDrag, me, ['show'])
        });
	},

	getPositioning: function(show) { // 0 - show | 1 - hide
		var me       = this,
            parent   = me.cmp,
            el       = parent.el,
			offset   = me.offset / 2,
            x, y;

        switch (me.side) {
        	case 'n' :
        		x = el.getLeft() + offset;
        		y = show ? (el.getTop() - me.getHeight() + 5) : el.getTop();
        		break;
        	case 'e' :
        		x = show ? (el.getRight() - 5) : (el.getRight() - me.getWidth());
        		y = el.getTop() + offset;
        		break;
        	case 's' :
        		x = el.getLeft() + offset;
        		y = show ? (el.getBottom() - 5) : (el.getBottom() - me.getHeight());
        		break;
        	case 'w' :
        		x = show ? (el.getLeft() - me.getWidth() + 5) : el.getLeft();
        		y = el.getTop() + offset;
        		break;
        }

        return [x, y];
	},

	setDrawerSize: function() {
		var me     = this,
			parent = me.cmp;

		if (me.side === 'n' || me.side === 's') {
			var width = parent.getWidth() - me.offset;
			me.setWidth(width);
		} else {
			var height = parent.getHeight() - me.offset;
			me.setHeight(height)
		}
	},

	afterRender: function() {
		var me     = this,
			parent = me.cmp,
			offset = me.offset / 2,
			anchor, offsets;

		me.callParent(arguments);

		switch (me.side) {
			case 'n' :
				anchor = 'tl';
				offsets = [offset, 0];
				break;
			case 'e' :
				anchor = 'tr';
				offsets = [me.getWidth()*-1, offset];
				break;
			case 's' :
				anchor = 'bl';
				offsets = [offset, me.getHeight()*-1];
				break;
			case 'w' :
				anchor = 'tl';
				offsets = [0, offset];
				break;
		}

		me.alignTo(parent.el, anchor, offsets);
	},

	show: function(anim) {
		var me     = this,
			parent = me.cmp;

		if (!me.rendered) {
			me.callParent(arguments);
		}

		me.setDrawerSize();
		parent.toFront();
		me.el.show();
		me.doAnim(true, anim);

		me.isShown = true;
	},

	hide: function(anim) {
		var me = this;

		me.doAnim(false, anim);

		me.isShown = me.parentMoving ? true : false;

		if (!!!anim) {
			me.el.hide();
		}
	},

	doAnim: function(show, anim) {
		var me   = this,
			pos  = me.getPositioning(show),
			anim = Ext.isDefined(anim) ? anim : me.useAnim;

		if (!show && anim) {
			anim = {
				listeners: {
					scope : me,
					afteranimate: me.onAfterAnimate //makes sure window's are hidden and not closed
				}
			};
		}

		me.setPosition(pos[0], pos[1], anim);
	},

	onAfterAnimate: function() {
		this.el.hide();
	},

	onWinResize: function() {
        var me = this;

        if (me.rendered) {
			me.setDrawerSize();
			me.doAnim(true, false);
        }
    },

    onWinStartDrag: function(func) {
        var me = this;

		if (me.isShown) {
			me.parentMoving = func === 'hide' ? true : false;
        	me[func](false);
        }
    }
})