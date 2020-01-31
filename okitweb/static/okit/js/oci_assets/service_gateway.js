/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
console.info('Loaded Service Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[service_gateway_artifact] = [virtual_cloud_network_artifact];

const service_gateway_query_cb = "service-gateway-query-cb";

/*
** Query OCI
 */
// TODO: Delete
function queryServiceGatewayAjax1(compartment_id, vcn_id) {
    console.info('------------- queryServiceGatewayAjax --------------------');
    let request_json = JSON.clone(okitQueryRequestJson);
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('service_gateway_filter' in okitQueryRequestJson) {
        request_json['service_gateway_filter'] = okitQueryRequestJson['service_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/ServiceGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            regionOkitJson[okitQueryRequestJson.region].load({service_gateways: response_json});
            //okitJson.load({service_gateways: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryServiceGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas(okitQueryRequestJson.region);
            $('#' + service_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
            $('#' + service_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        }
    });
}

/*
** Define ServiceGateway Class
 */
class ServiceGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + service_gateway_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(service_gateway_prefix, okitjson.service_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.service_name = 'All Services';
        this.autonomous_database_ids = [];
        this.object_storage_bucket_ids = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.virtual_cloud_networks) {
                if (parent.id === this.parent_id) {
                    this.getParent = function () {
                        return parent
                    };
                    break;
                }
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new ServiceGateway(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return service_gateway_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + this.id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        // Remove Service Gateway references
        for (let route_table of this.getOkitJson().route_tables) {
            for (let i = 0; i < route_table.route_rules.length; i++) {
                if (route_table.route_rules[i]['network_entity_id'] === this.id) {
                    route_table.route_rules.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        // Draw Connectors
        this.drawConnectors();
        console.groupEnd();
        return svg;
    }

    drawConnectors() {
        console.groupCollapsed('Drawing Connectors for ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        //let parent_svg = d3.select(d3Id(this.parent_id + "-svg"));
        //let parent_rect = d3.select(d3Id(this.parent_id));
        // Get Grand Parent
        let grandparent_id = d3.select(d3Id(this.parent_id)).attr('data-parent-id');
        // Define Connector Parent
        let parent_svg = d3.select(d3Id(grandparent_id + "-svg"));
        let parent_rect = d3.select(d3Id(grandparent_id));
        // Only Draw if parent exists
        if (parent_svg.node()) {
            console.info('Parent SVG     : ' + parent_svg.attr('id'));
            // Define SVG position manipulation variables
            let svgPoint = parent_svg.node().createSVGPoint();
            let screenCTM = parent_rect.node().getScreenCTM();
            svgPoint.x = d3.select(d3Id(this.id)).attr('data-connector-start-x');
            svgPoint.y = d3.select(d3Id(this.id)).attr('data-connector-start-y');
            let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
            console.info('Start svgPoint.x : ' + svgPoint.x);
            console.info('Start svgPoint.y : ' + svgPoint.y);
            console.info('Start matrixTransform.x : ' + connector_start.x);
            console.info('Start matrixTransform.y : ' + connector_start.y);

            let connector_end = null;

            if (this.autonomous_database_ids.length > 0) {
                for (let i = 0; i < this.autonomous_database_ids.length; i++) {
                    let autonomous_database_svg = d3.select(d3Id(this.autonomous_database_ids[i]));
                    if (autonomous_database_svg.node()) {
                        svgPoint.x = autonomous_database_svg.attr('data-connector-start-x');
                        svgPoint.y = autonomous_database_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, generateConnectorId(this.autonomous_database_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }

            if (this.object_storage_bucket_ids.length > 0) {
                for (let i = 0; i < this.object_storage_bucket_ids.length; i++) {
                    let object_storage_bucket_svg = d3.select(d3Id(this.object_storage_bucket_ids[i]));
                    if (object_storage_bucket_svg.node()) {
                        svgPoint.x = object_storage_bucket_svg.attr('data-connector-start-x');
                        svgPoint.y = object_storage_bucket_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, generateConnectorId(this.object_storage_bucket_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }
        }
        console.groupEnd();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.purple;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/service_gateway.html", function () {
            // Load Referenced Ids
            let autonomous_database_select = $('#autonomous_database_ids');
            for (let autonomous_database of okitJson.autonomous_databases) {
                if (me.compartment_id === autonomous_database.compartment_id) {
                    autonomous_database_select.append($('<option>').attr('value', autonomous_database.id).text(autonomous_database.display_name));
                }
            }
            let object_storage_bucket_select = $('#object_storage_bucket_ids');
            for (let object_storage_bucket of okitJson.object_storage_buckets) {
                if (me.compartment_id === object_storage_bucket.compartment_id) {
                    object_storage_bucket_select.append($('<option>').attr('value', object_storage_bucket.id).text(object_storage_bucket.display_name));
                }
            }
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
    }

    /*
    ** Static Query Functionality
     */

    static query(request = {}, region='') {
        console.info('------------- Service Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/ServiceGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({service_gateways: response_json});
                let len =  response_json.length;
                for(let i=0;i<len;i++ ){
                    console.info('Service Gateway Query : ' + response_json[i]['display_name']);
                }
                redrawSVGCanvas(region);
                $('#' + service_gateway_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + service_gateway_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', service_gateway_query_cb);
    cell.append('label').text(service_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(service_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'service_gateway_name_filter')
        .attr('name', 'service_gateway_name_filter');
});

