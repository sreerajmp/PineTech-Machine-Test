'use strict';

const Hapi = require('@hapi/hapi');
const fetch = require("node-fetch");



const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            const host = request.info.host;
            return 'Hello PineTech <br> 1. Task 1: Send POST request to <a href=http://localhost:3000/part-1> http://localhost:3000/part-1</a> with the required JSON   <br>2. Task 2: <a href="//'+host+'/part-2"> CliCk Here </a>';
        }
    });


    //Task 1
    server.route({
        method: 'POST',
        path: '/part-1',
        handler: function (request,h) {

            //get post params
            const data = request.payload;

            //calling recursive function to build tree from JSON
            return tree_format(data);

            // Rebuilding JSON to tree_format
            function tree_format(data, parent=null){
                var branch = [];
                var i,x;
                for (i = 0; i < Object.keys(data).length; i++) {

                    for (x in data[i]) {
                        //compare if all child's parent ID with the ID 
                        if(data[i][x].parent_id==parent){
                            var child = tree_format(data,data[i][x].id);

                            //adding the child under the current parent if the child response is not empty
                            if(child.length){
                                data[i][x].children = child;
                            }
                            branch.push(data[i][x]);
                        }
                    }
                }
                return branch;
            }
        }
    });


    // Task 2
    server.route({
        method: 'GET',
        path: '/part-2',
        handler: function (request,h) {

            const params = request.query
            const host = request.info.host;

            //checking page params
            var url,page;
            if(params.page===undefined || params.page==1){
                url = "https://api.github.com/search/repositories?q=nodejs&per_page=10&sort=stars&order=desc";
                page = 1;
            }else {
                url = "https://api.github.com/search/repositories?q=nodejs&per_page=10&sort=stars&order=desc&page="+params.page;
                page = parseInt(params.page);
                if(!Number.isInteger(page)){
                    page=1;
                }

                if(page>100){
                    return 'Only the first 1000 search results are available..  Return to <a href="//'+host+'/part-2?page=1">Page 1</a>';
                }
            }


            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    var x,i;

                    //building table
                    var html = '<table border="1px solid #dddddd">';
                    html += '<tr><th colspan="4"><h1>Github Repo for NodeJS</h1></th></tr>';
                    html += '<tr><th>Name</th><th>Description</th><th>Git Clone URL</th><th> Star Counts</th></tr>';

                    //looping response and printing
                    for (i in data) {
                        for (x in data[i]) {
                            html += '<tr>'

                            html += '<td> <a target="_BLANK" href="' + data[i][x].html_url + '"> ' + data[i][x].name + ' </a></td>'
                            html += '<td>' + data[i][x].description + '</td>'
                            html += '<td>' + data[i][x].clone_url + '</td>'
                            html += '<td>' + data[i][x].stargazers_count + '</td>'

                            html += '</tr>'
                        }
                    }

                    //Pagination 
                    if(page==1){
                        html += '<tr><th colspan="4"> <b>1</b> &nbsp&nbsp <a href="//'+host+'/part-2?page='+ (parseInt(page)+1) +'">Next</a></th></tr>';
                    }else{
                        html += '<tr><th colspan="4"> <a href="//'+host+'/part-2?page='+ (page-1) +'">Prev</a>  &nbsp&nbsp <b> '+page+' </b> &nbsp&nbsp <a href="//'+host+'/part-2?page='+ (parseInt(page)+1) +'">Next</a> </th></tr>';
                    }

                    html += '</table>'
                    return html;
                })
                .catch(err => console.log(err));
        }
    });



    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});



init();

