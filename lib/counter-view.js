'use babel';

export default class CounterView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('story-counter');
    this.element.classList.add('inline-block');

    // Create message element
    var message = document.createElement('div');
    message.textContent = '[0]';
    message.classList.add('story-counter-text');
    this.element.appendChild(message);
    this.template = '[ ${count} 字 ]'
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

  setCount(count) {
    this.element.children[0].textContent = this.template.replace('${count}', count);
  }

}
