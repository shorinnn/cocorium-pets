var cocoriumFood = {
    new : function(name, karma, nutrition){
        this.name = name;
        this.karma = karma;
        this.nutrition = nutrition;
        this.eatable = false;
        this.show = function(){
           func = "main.foods['"+this.name+"'].eatMe()";
           $('.canvas').append("<div class='food "+this.name+"' title='"+this.name+"' onclick=\""+func+"\"></div>");  
           $('.'+this.name).css('left', randomNum(50, $('.canvas').outerWidth() - 50 ));
           $('.'+this.name).css('top', randomNum(20, $('.canvas').outerHeight()/2 - 50 ));
        };
        this.eatMe = function(){
            if( !this.eatable ) return false;
            main.info( main.pet.name + ' ate ' + this.name+" (Karma: "+this.karma+", Nutrition: "+this.nutrition+")");
            main.pet.feed( this );
            this.consumed();
            if(this.name=='beans') main.boo_snd.play();
            else main.food_snd.play();
        };
        
        this.consumed = function(){
            $('.'+this.name).fadeOut();
            self = this;
            setTimeout(
                    function(self) { 
                        self.regen(); 
                    }, 5000, self);
        };
        
        this.regen = function(){
            $('.'+this.name).fadeIn();
            $('.'+this.name).css('left', randomNum(50, $('.canvas').outerWidth() - 50 ));
            $('.'+this.name).css('top', randomNum(20, $('.canvas').outerHeight()/2 - 50 ));
        };
        
        return this;
    }
};
