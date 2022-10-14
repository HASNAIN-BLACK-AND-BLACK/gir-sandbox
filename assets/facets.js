class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    // document.querySelectorAll('.js-facet-remove').forEach((element) => {
    //   element.classList.toggle('disabled', disable);
    // });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }


    if (document.getElementById("product-grid").classList.contains("grid-layout")) {
      document.getElementById('ProductGridContainer').classList.add('grid-layout');
      setTimeout(function() {
        clpLayoutControls("twoColumnLayout");
        document.getElementById('ProductGridContainer').classList.remove('grid-layout');
      }, 1000);
    } else {
      setTimeout(function() {
        clpLayoutControls("fourColumnLayout");
        document.getElementById('ProductGridContainer').classList.remove('grid-layout');
      }, 1000);
    }
    // setTimeout(loadMoreProducts, 1000);

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        // FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    // FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
  }

  // static renderProductCount(html) {
  //   const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
  //   const container = document.getElementById('ProductCount');
  //   const containerDesktop = document.getElementById('ProductCountDesktop');
  //   container.innerHTML = count;
  //   container.classList.remove('loading');
  //   if (containerDesktop) {
  //     containerDesktop.innerHTML = count;
  //     containerDesktop.classList.remove('loading');
  //   }
  // }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];
    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
    if ($(".mobile-facets__checkbox:checked").length > 0) {
      $("#ProductGridContainer").addClass("hide-promo-blocks");
    } else {
      $("#ProductGridContainer").removeClass("hide-promo-blocks");
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'))
      this.onSubmitForm(searchParams, event)

      setTimeout(updateProductCountFilter, 500);

    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';
      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event)
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);



// Adjust filter drawer position on scroll
const headerEl = document.getElementById("shopify-section-header");
const facetsForm = document.getElementById("FacetFiltersFormMobile");
const collcetionGridOffset = document.getElementById("ProductGridContainer").offsetTop;
const filterCloseBtn = document.querySelector(".mobile-facets__close");
const categoriesbar = document.querySelector(".sub-categories");
const filterOpenBtn = document.querySelector(".mobile-facets__open");
const searchPageHeader = document.querySelector(".template-search__header");

const filderDrawerPosition = () => {
  var currPosition = window.scrollY || window.scrollTop || document.getElementsByTagName("html")[0].scrollTop;
  var winWidth = window.outerWidth;
  var filtersDrawer = document.querySelector(".mobile-facets__disclosure");
  if (categoriesbar) {
    var topPosition = categoriesbar.offsetTop + categoriesbar.offsetHeight;
  } else {
    var topPosition = searchPageHeader.offsetTop + searchPageHeader.offsetHeight;
  }

  if (currPosition == 0) {
    facetsForm.classList.add("custom-position");
    filterCloseBtn.classList.add("custom-position");

    if (winWidth > 749) {
      facetsForm.style.top = topPosition + "px";
      if (categoriesbar) {
        filterCloseBtn.style.top = (topPosition + 10) + "px";
      } else {
        filterCloseBtn.style.top = (topPosition + 15) + "px";
      }
    }
    document.querySelector(".facets-container-drawer").style.cssText = "z-index: 1";

  } else {
    if (currPosition > 20) {
      if (winWidth > 749 && filtersDrawer.classList.contains("menu-opening")) {
          filterCloseBtn.click();
      }
    } else {
      // facetsForm.style.top = headerEl.offsetHeight + "px";
      // filterCloseBtn.style.top = headerEl.offsetHeight + "px";
    }
  }
}


const filterDrawerIndexing = () => {
  filderDrawerPosition();
  $("#shopify-section-header").addClass("transform-for-search");
}

filterCloseBtn.addEventListener("click", () => {
  $("#shopify-section-header").removeClass("transform-for-search");
});

document.addEventListener("scroll", filderDrawerPosition);
filterOpenBtn.addEventListener("click", filterDrawerIndexing);
window.addEventListener('resize', filderDrawerPosition, true);
filderDrawerPosition();


const filterHeaders = Array.from(document.querySelectorAll(".filter-header"));
filterHeaders.forEach(node => {
  node.addEventListener("click", (e) => {
    let el = event.target;
    el.closest(".accordion-section").classList.toggle("accordion-section--expanded");
    
    if ($(el).next(".mobile-facets__list").find(".mobile-facets__label").attr("tabindex")) {
      $(el).next(".mobile-facets__list").find(".mobile-facets__label").removeAttr("tabindex");
    } else {
      $(el).next(".mobile-facets__list").find(".mobile-facets__label").attr("tabindex", 1);
    }

    if (el.closest(".accordion-section").getAttribute("aria-expanded") == "true") {
      el.closest(".accordion-section").setAttribute("aria-expanded", "false");
    } else {
      el.closest(".accordion-section").setAttribute("aria-expanded", "true");
    }
  });

  // Open accordion on pressing enter
  node.addEventListener("keypress", function(event) {
    let el = event.target;
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      el.click();
    }
  
  });
});

const filterBtns = Array.from(document.querySelectorAll(".mobile-facets__label"));

filterBtns.forEach(node => {
  node.addEventListener("keypress", function(event) {
    let el = event.target;

    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      el.click();
    }
  });

});


// Uncheck all filters when click on clear btn
var clearBtn = document.querySelector(".mobile-facets__clear-wrapper");
clearBtn.addEventListener("click", function() {
  document.querySelectorAll(".mobile-facets__checkbox").forEach(function(item) {
      item.checked = false;
  });

  if (document.getElementById("product-grid").classList.contains("grid-layout")) {
    setTimeout(function() {
      clpLayoutControls("twoColumnLayout");
    }, 1000);
  } else {
    setTimeout(function() {
      clpLayoutControls("fourColumnLayout");
    }, 1000);
  }

  if ($(".mobile-facets__checkbox:checked").length > 0) {
    $("#ProductGridContainer").addClass("hide-promo-blocks");
  } else {
    $("#ProductGridContainer").removeClass("hide-promo-blocks");
  }

  updateProductCountFilter();
});

// Update product count in view results button in filter drawer and adjust promo height
function updateProductCountFilter() {
  setTimeout(function() {
    document.querySelector(".facets-view-results").innerText = "View Results (" + document.querySelectorAll("#product-grid .product-card").length + ")";

    var filteredProdsCount =  document.querySelectorAll(".product-grid .product-card").length;
    if (filteredProdsCount < 3) {
      document.getElementById("product-grid").classList.add("one-row");
    } else {
      document.getElementById("product-grid").classList.remove("one-row");
    }
  }, 1000);
}
updateProductCountFilter();


$('.mobile-facet-Color').each(function() {
    if ($(this).find(".color-swatch").length < 1) {
         $(this).hide();   
    }
})