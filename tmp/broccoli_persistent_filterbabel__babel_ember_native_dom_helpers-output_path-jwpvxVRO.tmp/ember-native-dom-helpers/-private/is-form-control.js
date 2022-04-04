export default function isFormControl(el) {
  var formControlTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
  var tagName = el.tagName,
      type = el.type;


  if (type === 'hidden') {
    return false;
  }

  return formControlTags.indexOf(tagName) > -1;
}