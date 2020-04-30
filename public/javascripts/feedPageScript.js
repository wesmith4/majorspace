
function displayReplyForm(id) {
  console.log('showReplyForm function initiated');
  let form = document.getElementById(`${id}-reply-form`);
  if (form.style.display === 'none') {
    $(`#${id}-reply-form`).show();
    form.style.display = 'block';
    $(`#${id}-reply-body`).focus();
  } else {
    form.style.display = 'none';
  }
}

function showReplies(id) {
  console.log('Showing messages replies for message #', id);
  let section = document.getElementById(`${id}-replies`);
  if (section.style.display === 'none') {
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
}
