module.exports = {
    // Handlebars helper functions
    select: function( value, options ){
        // var select= document.getElementsByClassName('mySelect');
        // var option= select.options [select.selectedIndex].value;
        // var attr= document.createAttribute("selected"); attr.value='selected'; 
        // options.setAttributeNode(attr);
        // return options;
        var $el = ('<select />').html( options.fn(this) );
        $el.find('[value="' + value + '"]').attr({'selected':'selected'});
        return $el.html();
    }
}