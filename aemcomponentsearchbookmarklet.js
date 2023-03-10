(function () {
  var PREFIX = '/apps';
  if (!window.Coral) {
    alert('Not Site Admin or AEM page in Edit Mode!');
    throw new Error('not a coral page!');
  }
  var ui = $(window).adaptTo('foundation-ui'),
    ID_DLG = 'compsDlg',
    old = document.getElementById(ID_DLG);
  ui.wait();
  if (old) {
    old.show();
    ui.clearWait();
    throw new Error('dialog exists! show');
  }
  Coral.Autocomplete.prototype._setInputValues = Coral.Autocomplete.prototype._handleInput = Coral.Autocomplete.prototype._handleItemSelectedChange = function () {
    return false;
  };
  Coral.Autocomplete.prototype._handleItemValueChange = function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  };
  Coral.Autocomplete.prototype._handleSelect = function (evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    Coral.commons.nextFrame(function () {
      window.open(`/mnt/overlay/wcm/core/content/sites/components/details.html${evt.matchedTarget.value}`, '_compDetails').focus();
    });
  };
  fetch(`${window.location.origin}/bin/querybuilder.json?group.1_type=cq:Template&group.2_type=cq:Component&group.p.or=true&orderby=path&orderby.sort=asc&p.limit=-1&path=${PREFIX}`).then((resp) => resp.json()).then((data) => {
    showData(data.hits);
  }).catch((err) => {
    ui.notify('', err, 'warning');
    console.log(err);
  }).finally(function () {
    ui.clearWait();
  });

  function showData(items) {
    var compList = new Coral.Autocomplete().set({
      placeholder: 'Type component name',
      icon: 'search',
    });
    compList.style.width = '37em';
    var len = items.length;
    for (var i = 0; i < len; i++) {
      var item, resType, group;
      item = items[i];
      resType = item.path.replace('/apps/', '');
      group = '';
      if (!item.path.startsWith(PREFIX)) {
        continue;
      }
      var entry = new Coral.Autocomplete.Item().set({
        value: item.path,
        content: {
          innerHTML: `<li class='coral-List--minimal' title='${resType}'>${group}<b>${Granite.I18n.get(item.title)}</b>&nbsp;(${resType})</li>`,
        },
      });
      compList.items.add(entry);
    }
    var dialogContent = new Coral.Dialog.Content();
    dialogContent.appendChild(compList);
    dialogContent.style.width = '40em';
    window._dlg = new Coral.Dialog().set({
      id: ID_DLG,
      header: {
        innerHTML: 'Components Lookup <span style=\'font-size:8pt;color:#ccc\'>(ESC to close)</span>&nbsp;<a class=\'coral-Link\' tabindex=\'-1\' target=\'_aemComps\' href=\'/libs/wcm/core/content/sites/components.html\'><coral-icon icon=\'alias\' size=\'XS\'></coral-icon></a>',
      },
      content: dialogContent,
      footer: {
        innerHTML: `<button is='coral-button'variant='primary'coral-close=''>Close</button>`,
      },
    }).show();
    compList.showSuggestions();
    compList._triggerChangeEvent = false;
    ui.clearWait();
    $(window._dlg).on('coral-overlay:open', function (e) {
      $(window._dlg).find('coral-autocomplete input.coral-Autocomplete-input').focus();
    });
  }
})();
