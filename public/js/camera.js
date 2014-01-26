
function Player ( data, model_manager ) {
    this.hash = data['hash'];
    this.name = data['name'];

    this.model_manager = model_manager;
}

function MainPlayer ( name, model_manager ) {
    var timestamp = Math.round(+new Date()/100);
    this.hash = timestamp.toString(36).toUpperCase();

    this.name = name;
    this.model_manager = model_manager;
}

MainPlayer.prototype = new Player( );
