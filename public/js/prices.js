(function(){
  fetch('/data/prices.json?v='+Date.now())
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

        // Update "Save XX%" and "-XX%" badges inside the card
        var walker2 = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null, false);
        while(walker2.nextNode()){
          var txt = walker2.currentNode.textContent.trim();
          if(/^Save \d+%$/i.test(txt)){
            walker2.currentNode.textContent = 'Save ' + disc + '%';
          } else if(/^Ahorra \d+%$/i.test(txt)){
            walker2.currentNode.textContent = 'Ahorra ' + disc + '%';
          } else if(/^-\d+%$/.test(txt)){
            walker2.currentNode.textContent = '-' + disc + '%';
          }
        }
      });

      // --- 1b. Promo code badges: data-promo-for="<productId>" ---
      document.querySelectorAll('[data-promo-for]').forEach(function(el){
        var id = el.dataset.promoFor;
        var code = (data.activities && data.activities[id] && data.activities[id].promoCode)
          || (data.boats && data.boats[id] && data.boats[id].promoCode)
          || data.promoCode || '';
        if (code) el.textContent = code;
      });

      // --- 1b2. Comparison-table cells: data-boat-price="<boatId>" shows the
      // discounted from-price for that boat ---
      document.querySelectorAll('[data-boat-price]').forEach(function(el){
        var b = data.boats[el.dataset.boatPrice];
        if(!b) return;
        var d = b.discount || 0;
        el.textContent = '$' + Math.round(b.regularPrice * (1 - d / 100)).toLocaleString();
      });

      // --- 1c. "Up to XX% off" banners: data-max-discount="page" uses the boats
      // shown on this page; "site" uses the highest discount across all boats ---
      document.querySelectorAll('[data-max-discount]').forEach(function(el){
        var ids;
        if(el.dataset.maxDiscount === 'site'){
          ids = Object.keys(data.boats);
        } else {
          ids = [];
          document.querySelectorAll('[data-boat]').forEach(function(c){
            if(ids.indexOf(c.dataset.boat) === -1) ids.push(c.dataset.boat);
          });
          if(ids.length === 0) ids = Object.keys(data.boats);
        }
        var max = 0;
        ids.forEach(function(id){
          var b = data.boats[id];
          if(b && b.discount > max) max = b.discount;
        });
        if(max > 0){
          var wb = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
          while(wb.nextNode()){
            var node = wb.currentNode;
            if(/\d+%/.test(node.textContent)){
              node.textContent = node.textContent.replace(/\d+%/, max + '%');
            }
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
