$(document).ready(function() {
    const apiRoot = 'http://localhost:8080/v1/';

    var paramCodes = [{code: "PM2.5", description: "PM 2.5"}, {code: "PM10", description: "PM 10"}];

    getReport();
    getCities();

    function getReport() {
        const requestUrl = apiRoot + 'pollution/report';

        $.ajax({
            url: requestUrl,
            method: 'GET',
            contentType: "application/json",
            success: function(report) {
                populateReportsTable(report);
            }
        });
    }

    function getCities() {
        const requestUrl = apiRoot + "pollution/cities";

        $.ajax({
            url: requestUrl,
            method: 'GET',
            contentType: "application/json",
            success: function(cities) {
                populateSelect(cities);
            }
        });
    }

    function populateSelect(cities) {
        cities.forEach(city => {
            $('[data-city-select]').append(getOption(city));
        });
        var sel = $('[data-city-select]');
        var selected = sel.val(); // cache selected value, before reordering
        var opts_list = sel.find('option');
        opts_list.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
        sel.html('').append(opts_list);
        sel.val(selected); // set cached selected value
    }

    function getOption(city) {
        return $('<option>')
            .addClass('city-select__option')
            .val(city.name)
            .text(city.name);
    }

    function handleSubscribeRequest(event) {
        event.preventDefault();

        var emailField = $(this).find('[name="email"]');
        var email = emailField.val();
        var cityField = $(this).find('[name="city"]');
        var cityName = cityField.val();

        validate(email);

        var requestUrl = apiRoot + 'subscription';

        $.ajax({
            url: requestUrl,
            method: 'POST',
            processData: false,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                email: email,
                city: cityName
            }),
            complete: function(data) {
                if (data.status === 200) {
                    showSubscriptionMessage();
                }
                $('[data-subscribe-form]')[0].reset();
            }
        });
    }

    function populateReportsTable(report) {
        var trhead = "<td><b>City</b></td>";
        const reports = report.entries;
        paramCodes.forEach(paramCode => trhead = trhead + "<td><b>" + paramCode.description + "</b>" + "<br>(μg/m3)" + "</td>");
        $("#reports-table-head").append("<tr>").append(trhead + "</>");

        $.each(reports, function(index, value) {
            let tr = $('<tr />');
            let clazz = value.index.toLowerCase();
            tr.append("<td class=" + clazz + "><b>" + value.cityName + "</b></td>");
            paramCodes.forEach(paramCode => {
                tr.append(getValueClass(value.values[paramCode.code], clazz));
            });
            $("#reports-table-body").append(tr);
        });
    }

    function getValueClass(value, clazz) {
        if (value === 'NaN' || value === undefined) return "<td class='" + clazz + "'> - </td>";
        return "<td class='" + clazz + "'>" + roundTo(value) + "</td>";
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function validate(email) {
        const $result = $("#result");
        $result.text("");

        if (validateEmail(email)) {
            $result.text("");
        } else {
            $result.text(email + " is not valid email address.");
            $result.css("color", "#f092a5");
        }
        return false;
    }

    function showSubscriptionMessage() {
        $('.msg').fadeToggle(200);
        $('.message').toggleClass('message_shown');
    }

    function roundTo(num) {
        return + (Math.round(num + "e+3")  + "e-3");
    }

    $('#ok_button').click(function(){showSubscriptionMessage()});

    $('[data-subscribe-form]').on('submit', handleSubscribeRequest);
});