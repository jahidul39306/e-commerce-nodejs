const deleteProduct = btn => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;
    const url = '/admin/delete-product/' + productId;

    const productElement = btn.closest('article');

    fetch(url, {
        method: 'DELETE',
        headers: {
            'CSRF-Token': csrfToken
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err => console.log(err));
}