(function () {
    function toggleReservationFields() {
        var selected = document.querySelector('input[name="inquiry_type"]:checked');
        var resField = document.getElementById("reservation-details");
        if (!selected || !resField) return;

        var show = selected.value !== "general";
        resField.classList.toggle("active", show);
        resField.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.disabled = !show;
        });
    }

    function setup() {
        document.querySelectorAll('input[name="inquiry_type"]').forEach(function (input) {
            input.addEventListener("change", toggleReservationFields);
        });
        toggleReservationFields();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
})();
