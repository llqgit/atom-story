'use babel';

export default class IndentView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('story-indent');
    this.element.classList.add('inline-block');
    this.element.onclick = () => {
      this.toggleSwitch();
    };

    // Create message element
    var message = document.createElement('div');
    message.textContent = 'indent';
    message.classList.add('story-indent-text');

    this.element.appendChild(message);

    this.indentSwitch = false;
    this.element.children[0].textContent = "[<]";
    this.toggleSwitchCallback = null;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  toggleSwitch() {
    this.indentSwitch = !this.indentSwitch;
    if (this.indentSwitch) {
      this.element.children[0].textContent = "[>]";
    } else {
      this.element.children[0].textContent = "[<]";
    }
    if (this.toggleSwitchCallback) {
      this.toggleSwitchCallback(this.indentSwitch);
    }
  }

  getIndentSwitch() {
    return this.indentSwitch;
  }

  setToggleSwitchCallback(cb) {
    this.toggleSwitchCallback = cb;
  }
}
