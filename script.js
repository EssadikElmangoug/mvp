async function refreshData(){
    removeParentRows();
    const res = await fetch("https://giganalyzer.com:3000/mvp",{method:"GET"});
    const jsn = await res.json();
    const dataContainer = document.querySelector(".data");
    jsn.forEach(element => {
        const tr = document.createElement("tr");

        const category = document.createElement("td");
        const subCategory = document.createElement("td");
        const nestedCategory = document.createElement("td");
        const keywords = document.createElement("td");
        const sales = document.createElement("td");
        const competition = document.createElement("td");
        const lastUpdate = document.createElement("td");

        category.textContent = element.parentCategory;
        subCategory.textContent = element.subcategory;
        nestedCategory.textContent = element.nestedCategory;
        keywords.textContent = reviewFrequencyCalculator(element.averageReviewFrequency);
        sales.textContent = element.totalSales;
        competition.textContent = element.highestCompetition;
        lastUpdate.textContent = lastUpdateCalculator(element.lastUpdate);

        tr.appendChild(category);
        tr.appendChild(subCategory);
        tr.appendChild(nestedCategory);
        tr.appendChild(keywords);
        tr.appendChild(sales);
        tr.appendChild(competition);
        tr.appendChild(lastUpdate);

        dataContainer.appendChild(tr);
    });
}

function removeParentRows() {
    var table = document.querySelector('.data');
    var tds = table.getElementsByTagName('td');

    for (var i = 0; i < tds.length; i++) {
      var parent = tds[i].parentNode;
      parent.parentNode.removeChild(parent);
    }
}

function lastUpdateCalculator(lastUpdate){
    const last = (new Date() - new Date(lastUpdate))/1000;

    if(last<60){
        return parseInt(last) + ' Seconds Ago';
    }else if(last>=60 && last<3600){
        return parseInt(last/60) + ' Minutes Ago';
    }else if(last>=3600 && last<86400){
        return parseInt(last/3600) + ' Hours Ago';
    }else if(last>=86400 && last<2592000){
        return parseInt(last/86400) + ' Days Ago';
    }else if(last>=2592000 && last<31104000){
        return parseInt(last/2592000) + ' Months Ago';
    }else{
        return parseInt(last/31104000) + ' Years Ago';
    }
}

function reviewFrequencyCalculator(last){
    if(last<60){
        return parseInt(last) + ' Seconds';
    }else if(last>=60 && last<3600){
        return parseInt(last/60) + ' Minutes';
    }else if(last>=3600 && last<86400){
        return parseInt(last/3600) + ' Hours';
    }else if(last>=86400 && last<2592000){
        return parseInt(last/86400) + ' Days';
    }else if(last>=2592000 && last<31104000){
        return parseInt(last/2592000) + ' Months';
    }else{
        return parseInt(last/31104000) + ' Years';
    }
}
