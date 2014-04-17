/*\
title: $:/plugins/danielo/packAsPlugin/packAsPlugin.js
type: application/javascript
module-type: widget

encrypttiddler widget

```

```


\*/
(function (){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var packAsPlugin = function (parseTreeNode,options) {
    this.initialise(parseTreeNode,options);
    this.addEventListeners([
            {type: "tw-pack-plugin", handler: "handlePackevent"},
            {type: "tw-unpack-plugin", handler: "handleUnpackevent"}
            ]);
};

/*
Inherit from the base widget class
*/
packAsPlugin.prototype = new Widget();

/*
Render this widget into the DOM
*/
packAsPlugin.prototype.render = function (parent,nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
packAsPlugin.prototype.execute = function () {
    // Get attributes
     this.pluginDependencies=this.getAttribute("dependencies");
       this.pluginDescription=this.getAttribute("description") || "plugin packed with Danielo's pack plugin";
     this.pluginType=this.getAttribute("type") || "plugin";
      this.pluginVersion=this.getAttribute("version");

      this.pluginAuthor=this.getAttribute("author",$tw.wiki.getTiddlerText("$:/status/UserName") || "Danielo" );
      this.pluginName=this.getAttribute("name","yourPlugin") || "aPlugin" ;

     this.tiddlersFilter=this.getAttribute("filter","[!is[system]!is[shadow]!has[draft.of]]");
    // Construct the child widgets
    console.log("Execute: "+this.pluginAuthor+"-Name:"+this.pluginName+"-filter:"+this.tiddlersFilter);
	this.makeChildWidgets();

};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
packAsPlugin.prototype.refresh = function (changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(changedAttributes.tiddler || changedAttributes.name || changedAttributes.description ||
       changedAttributes.author || changedAttributes.filter || changedAttributes.type || changedAttributes.description) {
        this.refreshSelf(); //looks this function call the execute function again.
                            //Because this you can see the log of the execute function and then this one below.
            console.log("refresh: "+this.pluginAuthor+"-Name:"+this.pluginName+"-filter:"+this.tiddlersFilter);

        return true;
    } else {
        return this.refreshChildren(changedTiddlers);
    }
};

packAsPlugin.prototype.handlePackevent = function (event){
    var pluginFields=this.createPluginTiddler();
    var sourceTiddlers=this.wiki.filterTiddlers(this.tiddlersFilter);
    var components=[];
    console.log("Pack of plugins to include ["+sourceTiddlers+"]");
    for(var i=0;i<sourceTiddlers.length;i++){
        components.push(this.createComponentTiddler(sourceTiddlers[i]));
        console.log("Packing: "+sourceTiddlers[i]);
        }

    this.saveTiddler("",pluginFields);
    console.log("Created plugin tiddler "+pluginFields.title + " Version "+pluginFields.version);
    $tw.utils.repackPlugin(pluginFields.title,components);

    this.setVariable("resultPlugin",pluginFields.title);
};

packAsPlugin.prototype.handleUnpackevent = function (event){
//WIP
};

packAsPlugin.prototype.getBasicTitle = function (){ return "$:/plugins/"+this.pluginAuthor+"/"+this.pluginName };

packAsPlugin.prototype.createComponentTitle = function (componentName){
return this.getBasicTitle()+"/"+this.basename(componentName)
};

packAsPlugin.prototype.basename = function (path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
};

packAsPlugin.prototype.createComponentTiddler = function (originalTitle){
    var tiddler=this.wiki.getTiddler(originalTitle);
    if(tiddler){
        var componentTitle = this.createComponentTitle(originalTitle);
        this.saveTiddler(tiddler,{title:componentTitle});
        console.log("Created "+componentTitle);
        return componentTitle;
    }
};


packAsPlugin.prototype.createPluginTiddler = function (){
    var previousVersion = this.wiki.getTiddler(this.getBasicTitle());
    this.pluginVersion = previousVersion ? previousVersion.fields.version : this.pluginVersion;
    var fields={
                    title:this.getBasicTitle(),
                    dependencies: this.pluginDependencies,
                    description: this.pluginDescription,
                    version:this.pluginVersion,
                    "plugin-type":this.pluginType,
                    type:"application/json",
                    text: JSON.stringify({tiddlers:{}})
                };
        return fields;
};

packAsPlugin.prototype.saveTiddler=function (tiddler,fields){
    this.wiki.addTiddler(  new $tw.Tiddler(this.wiki.getModificationFields(),tiddler,fields ) );
};

exports.packPlugin = packAsPlugin;

})();