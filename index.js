const request = require('request-promise');
const _ = require('lodash');
const fs = require('fs');

async function getProducts() {
    var url = 'https://api.descontofocado.gpa.digital/v2/promotions/CRM5?cpf=' + CPF;
    try {
        var result = await request({uri:url, json:true});
        return result.data;            
    }
    catch(err) {
        console.log(err);
    }

}

async function checkDiscount(product) {
    var url = 'https://api.descontofocado.gpa.digital/pa/focused/activating';

    var data ={"promotion_id":product.offer_code,"cpf":CPF,"channel":"SPA"};

    return await request({method: 'POST', uri: url, body:data, json:true});
}

function format(product) {
    return `${product.product_name} com desconto de ${product.promo_percent} qt max de ${product.item_limit} \n`;
}

async function start() {
    var data = await getProducts();

    var availableProductsStr = '';

    await _.each(data.categories, async function (category) {
        let categoryName = category.category_name;
        console.log("marcando todos da categoria :" + categoryName);
        await _.each(category.promotions, async function (product) {
            console.log('produto ' + product.product_name);
            if(product.is_activated) {
                console.log('       ja ativado anteriormente!');
            }
            else {
                try {
                    await checkDiscount(product);
                    console.log('       produto ativado com sucesso!');
                }
                catch(err) {
                    console.log('       erro ao ativar o produto!');                    
                }
            }

            availableProductsStr += format(product);
        });
    });

    fs.writeFileSync("pda-lista-produtos.txt", availableProductsStr); 

    console.log("FIM!");
}   


start();
