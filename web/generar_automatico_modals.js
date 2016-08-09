

<script>
$(document).ready(function(){
    $("#myBtn").click(function(){
        $('<div>', { class:'modal-dialog' }).append(
          $('<div>', { class: 'modal-content'}). append(
            $('<div>', {class: 'modal-header'}).append(
              $('<button type="button" class="close" data-dismiss="modal">&times;</button>'),
              $('<h4 class="modal-title">Menú </h4>')
            ),

            $('<div>', {class: 'modal-body'}).append(
              $('<p>Some text in the modal.</p>')
            ),

            $('<div>', {class: 'modal-footer'}).append(
              $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            )
          )
        ).appendTo("#myModal");

        $("#myModal").modal();
    });
});
</script>
