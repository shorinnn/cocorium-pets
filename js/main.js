var main = {
    pet:null,
    foods:null,
    init:function(){
        $('body').append( '<div class="stage"></div>' );
        $('.stage').append('<div class="canvas"></div>');
        $('.stage').append('<div class="action-bar"></div>');
        $('.stage').append('<div class="message-bar"></div>');
        $('.stage').append('<div class="property-bar"></div>');
        $('.canvas').append('<div class="pc" data-toggle="popover" title="Use The PC" data-trigger="focus"  role="button" tabindex="0" \n\
            data-content="<button onclick=\'main.pet.js()\' class=\'btn btn-sm btn-primary\'>Practice JS</button> \n\
            <button onclick=\'main.pet.game()\' class=\'btn btn-sm btn-primary\'>Play A Game</button>\n\
            <br /><br /><button onclick=\'main.pet.saveProgress()\' class=\'btn btn-sm btn-primary\'><i class=\'glyphicon glyphicon-floppy-disk\'></i> SAVE</button> \n\
<button onclick=\'main.pet.work()\' class=\'btn btn-sm btn-danger\'>CODE FOR COCORIUM</button>\n\
        "></div>');
        
        
        
        if(localStorage.getItem('save')==null){
            name = '';
            while(name == '' || name.toLowerCase().indexOf("max")!=-1 || name.toLowerCase().indexOf("mac")!=-1){
                name = prompt('WELCOME!\nName your pet! E.g. PETinator');
            }
            this.pet = new cocoriumPet.new( name );
        }
        else{
            conf = confirm('Load Previous Save?');
            if(conf){
                this.pet = cocoriumPet.new(false, JSON.parse( localStorage.getItem('save') ) );
            }
            else{
                localStorage.clear();
                name = '';
                while(name == '' || name.toLowerCase().indexOf("max")!=-1 || name.toLowerCase().indexOf("mac")!=-1){
                    name = prompt('WELCOME!\nName your pet! E.g. PETinator');
                }
                this.pet = new cocoriumPet.new( name );
            }
        }
        this.foods = new Array();
        this.foods['beans'] = new cocoriumFood.new('beans',-5, 20);
        this.foods['beans'].show();
        this.foods['burger'] = new cocoriumFood.new('burger',+5, 10);
        this.foods['burger'].show();
        this.foods['squid'] = new cocoriumFood.new('squid',0, 12);
        this.foods['squid'].show();
        this.public_foods = ['beans','burger','squid'];
        
        
        $('.food').tooltip();
        this.pet.start();
        this.pet.stats();
        $('.pet').tooltip();
        $('[data-toggle="popover"]').popover({html:true});
        this.gun_snd = new Audio("sounds/gun.mp3");
        this.food_snd = new Audio("sounds/food.mp3");
        this.boo_snd = new Audio("sounds/boo.mp3");
        this.move_snd = new Audio("sounds/move.mp3");
        this.starve_snd = new Audio("sounds/starve.mp3");
        this.birthday_snd = new Audio("sounds/birthday.mp3");
        this.bells_snd = new Audio("sounds/bells.mp3");
        this.game_snd = new Audio("sounds/game.mp3");
        this.keyboard_snd = new Audio("sounds/keyboard.mp3");
        this.whip_snd = new Audio("sounds/whip.mp3");
        this.whip_2_snd = new Audio("sounds/whip.mp3");
        this.save_snd = new Audio("sounds/save.mp3");
        
    }
};

function randomNum(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}