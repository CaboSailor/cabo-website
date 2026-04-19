(function(){
  fetch('data/prices.json?v='+Date.now())
    .then(function(r){ return r.json(); })
    .then(function(data){

      // --- 1. Boat cards: update prices and "Save XX%" badges ---
      document.querySelectorAll('[data-boat]').forEach(function(card){
        var boatId = card.dataset.boat;
        var boat = data.boats[boatId];
        if(!boat) return;

        var disc = boat.discount || 0;
        var discountedPrice = Math.round(boat.regularPrice * (1 - disc / 100));
        var extraDiscounted = boat.extraGuestRegular > 0 ? Math.round(boat.extraGuestRegular * (1 - disc / 100)) : 0;

        // Find all elements whose text is exactly a dollar amount
        var priceEls = [];
        var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null, false);
        while(walker.nextNode()){
          var t = walker.currentNode.textContent.trim();
          if(/^\$[\d,]+$/.test(t)){
            priceEls.push(walker.currentNode.parentElement);
          }
        }
        // Order: [0] regularPrice, [1] discountedPrice, [2] extraGuestRegular, [3] extraGuestDiscounted
        if(priceEls[0]) priceEls[0].textContent = '$' + boat.regularPrice.toLocaleString();
        if(priceEls[1]) priceEls[1].textContent = '$' + discountedPrice.toLocaleString();
        if(priceEls[2] && boat.extraGuestRegular > 0) priceEls[2].textContent = '$' + boat.extraGuestRegular;
        if(priceEls[3] && extraDiscounted > 0) priceEls[3].textContent = '$' + extraDiscounted;

        // Update "Save XX%" badge inside the card
        var walker2 = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null, false);
        while(walker2.nextNode()){
          var txt = walker2.currentNode.textContent.trim();
          if(/^Save \d+%$/i.test(txt)){
            walker2.currentNode.textContent = 'Save ' + disc + '%';
          }
        }
      });

      // --- 2. Activity sections: update "From $X" and discount badges ---
      document.querySelectorAll('[data-activity]').forEach(function(section){
        var actId = section.dataset.activity;
        var act = data.activities[actId];
        if(!act) return;

        // Update "From $X,XXX" text
        var walker3 = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, null, false);
        while(walker3.nextNode()){
          var t3 = walker3.currentNode.textContent.trim();
          if(/^From \$[\d,]+/.test(t3)){
            walker3.currentNode.textContent = 'From $' + act.fromPrice.toLocaleString();
          }
          // Update "XX% Off" discount badge
          if(/^\d+% Off$/i.test(t3) && act.discountLabel){
            // Extract percentage from discountLabel like "Save 30%"
            var match = act.discountLabel.match(/(\d+)/);
            if(match){
              walker3.currentNode.textContent = match[1] + '% Off';
            }
          }
        }
      });

    })
    .catch(function(e){
      console.warn('Could not load prices:', e);
    });
})();
