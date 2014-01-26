function ModelsManager() {
    this.loading = [];

    this.loaded = [];
    this.geometry = {};
    this.materials = {};

}

ModelsManager.prototype.load_model = function ( model, player ){
    var self = this;

    if ( ! (model in self.loading) && ! (model in self.loaded) ){
        self.loading.push( model );
        var loader = new THREE.JSONLoader();
        loader.load( '/models/'+model+'.js', function ( geometry, materials ) {

                //app.shader = ShaderExtras["hatching"];
        //         app.shader = THREE.ShaderLib["lambert"];
        //         var u = THREE.UniformsUtils.clone(app.shader.uniforms);
        //         var vs = app.shader.vertexShader;
        //         var fs = app.shader.fragmentShader;
        //
        //         var smaterial = new THREE.ShaderMaterial({ uniforms: u, vertex_shader: vs,  fragment_shader: fs , });

                //smaterial.uniforms.uDirLightPos.value = app.directionalLight.position;
                //smaterial.uniforms.uDirLightColor.value = app.directionalLight.color;
        //         smaterial.wireframe = true;

        //         console.log(smaterial);

        //         morph = new THREE.Mesh( geometry, smaterial );
                self.loaded.push( model );
                self.geometry[model] = geometry;
                self.materials[model] = materials;
                var index = self.loading.indexOf(model);
                if (index > -1) {
                    self.loading.splice(index, 1);
                }
                player.load_mesh();
            });
        }
}

ModelsManager.prototype.get_geometry = function ( model ){
    var self = this;

    if ( self.loaded.indexOf(model) > -1 ){
        return self.geometry[model];
    }
    else{
        return false;
    }
}

ModelsManager.prototype.get_materials = function ( model ){
    var self = this;

    if ( self.loaded.indexOf(model) > -1 ){
        return self.materials[model];
    }
    else{
        return false;
    }
}

ModelsManager.prototype.is_loading = function ( model ){
    var self = this;
    return model in self.loading;
}

ModelsManager.prototype.loaded = function ( model ){
    var self = this;
    return self.loaded.indexOf(model) > -1;
}
