const templates = [
    {
      id: "wishlist-link",
      data: "wishlist",
      template: `
        <a href="{{ wishlist.url }}" class="wk-link wk-link--{{ wishlist.state }}" title="{{ locale.view_wishlist }}">
          <div class="wk-icon wk-link__icon">{% include "wishlist-icon" %}</div>
        </a>
      `,
    },
    {
      id: "wishlist-button",
      data: "product",
      events: {
        "click button[data-wk-add-product]": (event) => {
          event.preventDefault();
          event.stopPropagation();
  
          const variantInput = document.querySelector("form *[name='id']");
          const variantId = variantInput ? variantInput.value : undefined;
  
          WishlistKing.toolkit.addProduct(
            event.currentTarget.getAttribute("data-wk-add-product"),
            variantId
          );
        },
        "click button[data-wk-remove-product]": (event) => {
          event.preventDefault();
          event.stopPropagation();
  
          WishlistKing.toolkit.removeProduct(
            event.currentTarget.getAttribute("data-wk-remove-product")
          );
        },
        "click button[data-wk-remove-item]": (event) => {
          event.preventDefault();
          event.stopPropagation();
  
          WishlistKing.toolkit.removeItem(
            event.currentTarget.getAttribute("data-wk-remove-item")
          );
        },
      },
      template: `
        {% if product.in_wishlist %}
          {% assign btn_text = locale.in_wishlist %}
          {% assign btn_title = locale.remove_from_wishlist %}
          {% assign btn_action = 'remove' %}
        {% else %}
          {% assign btn_text = locale.add_to_wishlist %}
          {% assign btn_title = locale.add_to_wishlist %}
          {% assign btn_action = 'add' %}
        {% endif %}
  
        {% assign scope = "product" %}
        {% assign targetId = product.id %}
        {% assign icon_name = "wishlist-icon" %}
  
        {% if itemId %}
        {% assign scope = "item" %}
        {% assign targetId = itemId %}
        {% assign icon_name = "remove-icon" %}
        {% endif %}
  
        <button type="button" class="wk-button wk-button--{{ btn_action }} {{ addClass }}" title="{{ btn_title }}" data-wk-{{ btn_action }}-{{ scope }}="{{ targetId }}">
          <div class="wk-icon wk-button__icon">{% include icon_name %}</div>
          <span class="wk-button__label">{{ btn_text }}</span>
        </button>
      `,
    },
    {
      id: "wishlist-button-floating",
      data: "product",
      template: `
        {% include "wishlist-button" addClass: "wk-button--floating" %}
      `,
    },
    {
      id: "wishlist-page",
      data: "wishlist",
      events: {
        "click a[data-wk-share]": (event) => {
          event.preventDefault();
          event.stopPropagation();
  
          WishlistKing.toolkit.requestWishlistSharing({
            wkShareService: event.currentTarget.getAttribute(
              "data-wk-share-service"
            ),
            wkShare: event.currentTarget.getAttribute("data-wk-share"),
            wkShareImage: event.currentTarget.getAttribute("data-wk-share-image"),
          });
        },
      },
      template: `
        <div class='wk-page {% if wishlist.read_only %}wk-page--shared{% endif %}'>

        <div class="wishlist-page-top">
          <h1 class="main-page-title">Wishlist</h1>
          {% if wishlist.item_count == 0 %}
    
              <div class="wk-note wk-note__list-empty">
                <p>{{ locale.wishlist_empty_note }}</p>
              </div>
    
          {% else %}
    
            {% if customer_accounts_enabled and customer == null and wishlist.read_only == false %}
              <div class="wk-note wk-note__login">
                <p>{{ locale.login_or_signup_note }}</p>
              </div>

              {% else %}

              {% unless wishlist.read_only %}
                <div class="wk-sharing">
                  <ul class="wk-sharing__list">
                    <li class="wk-sharing__list-item">{% include "wishlist-share-button-fb" %}</li>
                    <li class="wk-sharing__list-item">{% include "wishlist-share-button-twitter" %}</li>
                    <li class="wk-sharing__list-item">{% include "wishlist-share-button-email" %}</li>
                    <li class="wk-sharing__list-item">{% include "wishlist-share-button-link" %}</li>
                    <li class="wk-sharing__list-item">{% include "wishlist-share-button-whatsapp" %}</li>
                    {% comment %}<li class="wk-sharing__list-item">{% include "wishlist-share-button-contact" %}</li>{% endcomment %}
                  </ul>
                  <div class="wk-sharing__link wk-sharing__link--hidden"><span class="wk-sharing__link-text"></span><button class="wk-sharing__link__copy-button" data-clipboard-target=".wk-sharing__link-text">{{ locale.copy_share_link }}</button></div>
                </div>
              {% endunless %}



            {% endif %}
          </div>
  
          <div>
            <div class="wk-grid">
              {% assign item_count = 0 %}
              {% assign products = wishlist.products | reverse %}
              {% for product in products %}
                {% assign item_count = item_count | plus: 1 %}
                {% unless limit and item_count > limit %}
                  {% assign hide_default_title = false %}
                  {% if product.variants.length == 1 and product.variants[0].title contains 'Default' %}
                    {% assign hide_default_title = true %}
                  {% endif %}
  
                  {% assign variant = product.selected_or_first_available_variant %}
                  {% if variant.price < variant.compare_at_price %}
                    {% assign onsale = true %}
                  {% else %}
                    {% assign onsale = false %}
                  {% endif %}
                  <div>
                    <div class="wk-grid__item {% if onsale %}wk-product--sale{% endif %}" data-wk-item="{{ product.wishlist_item_id }}">
                      {% unless wishlist.read_only %}
                        {% include "wishlist-button-floating" itemId: product.wishlist_item_id %}
                      {% else %}
                        {% include "wishlist-button-floating" product: product %}
                      {% endunless %}
  
                      <a href="{{ product | variant_url }}" class="wk-product-image" title="{{ locale.view_product }}" style="background-image: url({{ product | variant_img_url: '1000x' }})"></a>
  
                      <div class="wk-product-info">
                        <a class="wk-product-title" href="{{ product | variant_url }}">
                          {{ product.title }}
                          
                        </a>
                        <p>{{ product.metafields.product.subtitle }}</p>
                        <div class="wk-product-price">
                          <span class="wk-product-price--current">{{ variant.price | money }}</span>
                          <span class="wk-product-price--compare">{{ variant.compare_at_price | money }}</span>
                        </div>
                      </div>
  
                    </div>
                  </div>
                {% endunless %}
              {% endfor %}
            </div>
          </div>
  
          {% comment %}
          {% include "wishlist-button-bulk-add-to-cart" %}
          {% endcomment %}
  
          {% comment %}
          {% unless wishlist.read_only %}
            {% include "wishlist-button-clear" %}
          {% endunless %}
          {% endcomment %}
  
          
        {% endif %}
        </div>
      `,
    },
    {
      id: "wishlist-product-form",
      events: {
        "render .wk-product-form": (form) => {
          const container = form.closest("[data-wk-item]");
          const itemId = container.getAttribute("data-wk-item");
          WishlistKing.toolkit.getItem(itemId).then((product) => {
            WishlistKing.toolkit.initProductForm(form, product, {
              // NOTE: Uncomment to override default option change
              // onOptionChange: (event) => {
              //   console.log(event.dataset);
              // },
              // NOTE: Uncomment to override default form submit
              // onFormSubmit: (event) => {
              //   event.preventDefault();
              //   event.stopPropagation();
              // },
            });
          });
        },
      },
      template: `
        <form class="wk-product-form" action="/cart/add" method="post">
          {% assign current_variant = product.selected_or_first_available_variant %}
          <div class="wk-product-form__options">
            <input name="id" value="{{ current_variant.id }}" type="hidden">
            {% unless product.has_only_default_variant %}
              {% for option in product.options_with_values %}
                <div class="wk-product-form__option">
                  <label class="wk-product-form__option__label" for="Option{{ option.position }}">
                    {{ option.name }}
                  </label>
                  <select class="wk-product-form__option__select" name="options[{{ option.name | escape }}]">
                    {% for value in option.values %}
                      <option value="{{ value | escape }}" {% if option.selected_value == value %}selected="selected"{% endif %} {% if option.soldout_values contains value %}disabled{% endif %}>
                        {{ value }}
                      </option>
                    {% endfor %}
                  </select>
                </div>
              {% endfor %}
            {% endunless %}
            {% comment %}
            <div class="wk-product-form__quantity">
              <label class="wk-product-form__quantity__label" for="Quantity">{{ locale.quantity }}</label>
              <input class="wk-product-form__quantity__input" type="number" name="quantity" value="1" min="1">
            </div>
            {% endcomment %}
          </div>
          <button type="submit" class="wk-product-form__submit" data-wk-add-to-cart="{{ product.wishlist_item_id }}" {% unless current_variant.available %}disabled{% endunless %}>
            {% if current_variant.available %}{{ locale.add_to_cart }}{% else %}{{ locale.sold_out }}{% endif %}
          </button>
        </form>
      `,
    },
    {
      id: "wishlist-page-shared",
      data: "shared_wishlist",
      template: `
        {% assign wishlist = shared_wishlist %}
        {% include "wishlist-page" with wishlist %}
      `,
    },
    {
      id: "wishlist-button-bulk-add-to-cart",
      data: "wishlist",
      events: {
        "click button[data-wk-bulk-add-to-cart]": (event) => {
          WishlistKing.toolkit.requestAddAllToCart(
            event.currentTarget.getAttribute("data-wk-bulk-add-to-cart")
          );
        },
      },
      template: `
        {% assign btn_text = locale.add_all_to_cart %}
        {% assign btn_title = locale.add_all_to_cart %}
  
        <button type="button" class="wk-button-bulk-add-to-cart" title="{{ btn_title }}" data-wk-bulk-add-to-cart="{{ wishlist.permaId }}">
          <span class="wk-label">{{ btn_text }}</span>
        </button>
      `,
    },
    {
      id: "wishlist-button-clear",
      data: "wishlist",
      events: {
        "click button[data-wk-clear-wishlist]": (event) => {
          WishlistKing.toolkit.clear(
            event.currentTarget.getAttribute("data-wk-clear-wishlist")
          );
        },
      },
      template: `
        {% assign btn_text = locale.clear_wishlist %}
        {% assign btn_title = locale.clear_wishlist %}
  
        <button type="button" class="wk-button-wishlist-clear" title="{{ btn_title }}" data-wk-clear-wishlist="{{ wishlist.permaId }}">
          <span class="wk-label">{{ btn_text }}</span>
        </button>
      `,
    },
    {
      id: "wishlist-icon",
      template: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 13" fill="none">
      <rect width="14" height="13" fill="#545454"/>
      <g clip-path="url(#clip0_0_1)">
      <rect width="1400" height="5721" transform="translate(-1181 -49)" fill="white"/>
      <rect width="1400" height="110" transform="translate(-1181 -49)" fill="white"/>
      <path d="M12.3147 6.68901L7.49297 11.6365C7.29819 11.8364 6.9775 11.8381 6.78058 11.6403L1.85036 6.68901C0.815173 5.59947 -0.220016 3.42044 1.5053 1.60446C3.32013 -0.305737 5.78205 0.411118 6.93234 2.61153C7.01542 2.77046 7.26172 2.77035 7.34414 2.61107C8.48246 0.411019 10.845 -0.305604 12.6597 1.60446C14.3851 3.42044 13.3499 5.59947 12.3147 6.68901Z" stroke="#393435" stroke-width="0.7"/>
      </g>
      <defs>
      <clipPath id="clip0_0_1">
      <rect width="1400" height="5721" fill="white" transform="translate(-1181 -49)"/>
      </clipPath>
      </defs>
      </svg>
      `,
    },
    {
      id: "remove-icon",
      template: `
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
            <line x1="3.70711" y1="4" x2="22" y2="22.2929" stroke="black" stroke-linecap="round"/>
            <line x1="21.9092" y1="3.87508" x2="3.7072" y2="22.0771" stroke="black" stroke-linecap="round"/>
          </svg>
      `,
    },
    {
      id: "wishlist-share-button-fb",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.share_on_facebook }}" data-wk-share-service="facebook" data-wk-share="{{ wishlist.permaId }}">
          <svg version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.768,7.465H14.5V5.56c0-0.896,0.594-1.105,1.012-1.105s2.988,0,2.988,0V0.513L14.171,0.5C10.244,0.5,9.5,3.438,9.5,5.32 v2.145h-3v4h3c0,5.212,0,12,0,12h5c0,0,0-6.85,0-12h3.851L18.768,7.465z"/>
          </svg>
        </a>
      `,
    },
    {
      id: "wishlist-share-button-twitter",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.share_on_twitter }}" data-wk-share-service="twitter" data-wk-share="{{ wishlist.permaId }}">
          <svg version="1.1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24">
          <path fill="currentColor" d="M23.444,4.834c-0.814,0.363-1.5,0.375-2.228,0.016c0.938-0.562,0.981-0.957,1.32-2.019c-0.878,0.521-1.851,0.9-2.886,1.104 C18.823,3.053,17.642,2.5,16.335,2.5c-2.51,0-4.544,2.036-4.544,4.544c0,0.356,0.04,0.703,0.117,1.036 C8.132,7.891,4.783,6.082,2.542,3.332C2.151,4.003,1.927,4.784,1.927,5.617c0,1.577,0.803,2.967,2.021,3.782 C3.203,9.375,2.503,9.171,1.891,8.831C1.89,8.85,1.89,8.868,1.89,8.888c0,2.202,1.566,4.038,3.646,4.456 c-0.666,0.181-1.368,0.209-2.053,0.079c0.579,1.804,2.257,3.118,4.245,3.155C5.783,18.102,3.372,18.737,1,18.459 C3.012,19.748,5.399,20.5,7.966,20.5c8.358,0,12.928-6.924,12.928-12.929c0-0.198-0.003-0.393-0.012-0.588 C21.769,6.343,22.835,5.746,23.444,4.834z"/>
          </svg>
        </a>
      `,
    },
    {
      id: "wishlist-share-button-whatsapp",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.share_with_whatsapp }}" data-wk-share-service="whatsapp" data-wk-share="{{ wishlist.permaId }}">
          <svg xmlns="https://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
            <path fill="currentColor" stroke="none" d="M20.1,3.9C17.9,1.7,15,0.5,12,0.5C5.8,0.5,0.7,5.6,0.7,11.9c0,2,0.5,3.9,1.5,5.6l-1.6,5.9l6-1.6c1.6,0.9,3.5,1.3,5.4,1.3l0,0l0,0c6.3,0,11.4-5.1,11.4-11.4C23.3,8.9,22.2,6,20.1,3.9z M12,21.4L12,21.4c-1.7,0-3.3-0.5-4.8-1.3l-0.4-0.2l-3.5,1l1-3.4L4,17c-1-1.5-1.4-3.2-1.4-5.1c0-5.2,4.2-9.4,9.4-9.4c2.5,0,4.9,1,6.7,2.8c1.8,1.8,2.8,4.2,2.8,6.7C21.4,17.2,17.2,21.4,12,21.4z M17.1,14.3c-0.3-0.1-1.7-0.9-1.9-1c-0.3-0.1-0.5-0.1-0.7,0.1c-0.2,0.3-0.8,1-0.9,1.1c-0.2,0.2-0.3,0.2-0.6,0.1c-0.3-0.1-1.2-0.5-2.3-1.4c-0.9-0.8-1.4-1.7-1.6-2c-0.2-0.3,0-0.5,0.1-0.6s0.3-0.3,0.4-0.5c0.2-0.1,0.3-0.3,0.4-0.5c0.1-0.2,0-0.4,0-0.5c0-0.1-0.7-1.5-1-2.1C8.9,6.6,8.6,6.7,8.5,6.7c-0.2,0-0.4,0-0.6,0S7.5,6.8,7.2,7c-0.3,0.3-1,1-1,2.4s1,2.8,1.1,3c0.1,0.2,2,3.1,4.9,4.3c0.7,0.3,1.2,0.5,1.6,0.6c0.7,0.2,1.3,0.2,1.8,0.1c0.6-0.1,1.7-0.7,1.9-1.3c0.2-0.7,0.2-1.2,0.2-1.3C17.6,14.5,17.4,14.4,17.1,14.3z"/>
          </svg>
        </a>
      `,
    },
    {
      id: "wishlist-share-button-email",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.share_by_email }}" data-wk-share-service="email" data-wk-share="{{ wishlist.permaId }}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M0.571424 3.65826V12.344C0.571424 12.7858 0.929596 13.144 1.37142 13.144H14.6286C15.0704 13.144 15.4286 12.7858 15.4286 12.344V3.65826C15.4286 3.21643 15.0704 2.85826 14.6286 2.85826H1.37142C0.929599 2.85826 0.571424 3.21643 0.571424 3.65826Z" stroke="black" stroke-width="1.14286"/>
            <path d="M14.8571 3.42969C14.8571 3.42969 11.3344 6.07177 8.68498 8.0588C8.27864 8.36356 7.72063 8.36302 7.31428 8.05826L1.14285 3.42969" stroke="black" stroke-width="1.14286"/>
          </svg>
        </a>
      `,
    },
    {
      id: "wishlist-share-button-link",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.get_link }}" data-wk-share-service="link" data-wk-share="{{ wishlist.permaId }}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
           <path d="M8.28239 10.6858L6.56811 12.4001C6.18715 12.781 4.85382 14.1143 3.13953 12.4001C1.42525 10.6858 2.75858 9.35247 3.13953 8.97151L5.18856 6.92249C5.75998 6.35106 6.85715 5.14411 8.61713 6.92249" stroke="black" stroke-width="1.14286" stroke-linecap="round"/>
           <path d="M7.62045 4.5681L9.33473 2.85381C9.71569 2.47286 11.049 1.13957 12.7633 2.85382C14.4776 4.56807 13.1443 5.90144 12.7633 6.28239L10.7143 8.33141C10.1429 8.90284 9.04569 10.1098 7.28571 8.33141" stroke="black" stroke-width="1.14286" stroke-linecap="round"/>
          </svg>
        </a>
      `,
    },
    {
      id: "wishlist-share-button-contact",
      data: "wishlist",
      template: `
        <a href="#" class="wk-share-button" title="{{ locale.send_to_customer_service }}" data-wk-share-service="contact" data-wk-share="{{ wishlist.permaId }}">
          <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </a>
      `,
    },
  ];
  
  export default templates;
