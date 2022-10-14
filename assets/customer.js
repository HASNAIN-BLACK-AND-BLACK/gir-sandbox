const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
  addAddressButton: 'button[aria-controls="AddAddress"]',
  confirmDelete: '#ConfirmDelete button'
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message'
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    // this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container ? {
      container,
      addressContainer: container.querySelector(selectors.addressContainer),
      toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
      cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
      addAddress: container.querySelectorAll(selectors.addAddressButton),
      confirmDeleteBtn: container.querySelectorAll(selectors.confirmDelete)
    } : {};
  }

  // _setupCountries() {
  //   if (Shopify && Shopify.CountryProvinceSelector) {
  //     // eslint-disable-next-line no-new
  //     new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
  //       hideElement: 'AddressProvinceContainerNew'
  //     });
  //     this.elements.countrySelects.forEach((select) => {
  //       const formId = select.dataset.formId;
  //       // eslint-disable-next-line no-new
  //       new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
  //         hideElement: `AddressProvinceContainer_${formId}`
  //       });
  //     });
  //   }
  // }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      console.log(element)
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
    this.elements.addAddress.forEach((element) => {
      element.addEventListener('click', this._handleAddAddress);
    });
    this.elements.confirmDeleteBtn.forEach((element) => {
      element.addEventListener('click', this._handleConfirmDelete);
    });
  }


  _toggleDisplay(target) {
    if (target?.classList.contains('hidden')) {
      console.log("true")
      target?.classList.remove('hidden')
    }else{
      target?.classList.add('hidden')
      console.log("else")
    }

  }
  _toggleExpanded(target) {
    target.setAttribute(
      attributes.expanded,
      (target.getAttribute(attributes.expanded) === 'false').toString()
    );
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
    this._toggleDisplay(
      currentTarget.closest(".customer-address-item").nextElementSibling
    )
  }

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleDisplay(
      currentTarget.closest(selectors.addressContainer)
    )
    if (!currentTarget.closest("#AddressList")){
      this._toggleDisplay(
        document.querySelector("#AddressList")
      )
      this._toggleDisplay(
        document.querySelector(selectors.addAddressButton)
      )
      this._toggleDisplay(
        document.querySelector(".customer-no-address")
      )
    }

    // this._toggleExpanded(
    //   currentTarget
    //     .closest(selectors.addressContainer)
    //     .querySelector(`[${attributes.expanded}]`)
    // )
  }

  _handleConfirmDelete = () => {
    let addressData = document.querySelector("#ConfirmDelete button").getAttribute("data-confirm")
    if(addressData){
      Shopify.postLink(addressData, {
        parameters: { _method: 'delete' },
      });
    }
  }

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    document.querySelector("#ConfirmDelete button").setAttribute("data-confirm", `${currentTarget.dataset.target}`)
    document.querySelector("#ConfirmDelete").style.display = 'block'
    }
  
  _handleAddAddress = ({ currentTarget }) => {
    this._toggleDisplay(
      document.querySelector("#AddAddress")
    )
    this._toggleDisplay(
      document.querySelector("#AddressList")
    )
  
    this._toggleDisplay(
      document.querySelector(selectors.addAddressButton)
    )
    this._toggleDisplay(
      document.querySelector(".customer-no-address")
    )
  }
}

