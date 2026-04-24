$(document).ready(function() {

    const BASE_URL = "https://santosbaylin.github.io/"; 
    const TELEFONO_VENTAS = "51924178267";
    
    let fGen = "Todos", fCat = "Todas", fMarca = "Todas";

    function cargarMarcas() {
        const marcas = [...new Set(PRODUCTOS_DB.map(p => p.marca))];
        // Limpiamos el select excepto la opción por defecto
        $('#select-marca').html('<option value="Todas">Todas las Marcas</option>');
        marcas.forEach(m => $('#select-marca').append(`<option value="${m}">${m}</option>`));
    }

    function render() {
        const contenedor = $('#contenedor-tienda');
        contenedor.empty();

        // Lógica de filtrado
        const filtrados = PRODUCTOS_DB.filter(p => {
            const mGen = (fGen === "Todos" || p.genero === fGen);
            const mCat = (fCat === "Todas" || p.categoria === fCat);
            const mMarca = (fMarca === "Todas" || p.marca === fMarca);
            return mGen && mCat && mMarca;
        });

        filtrados.forEach(p => {
            const urlImagenCompleta = BASE_URL + p.img;

            const msj = `¡Hola! Me interesa este producto de tu catálogo:\n\n` +
                        `📌 *Modelo:* ${p.nombre}\n` +
                        `🏷️ *Marca:* ${p.marca}\n` +
                        `💰 *Precio:* s/${p.precio.toFixed(2)}\n` +
                        `📏 *Tallas:* ${p.tallas.join(', ')}\n\n` +
                        `🔗 *Ver producto:* ${urlImagenCompleta}`;

            const linkWA = `https://api.whatsapp.com/send?phone=${TELEFONO_VENTAS}&text=${encodeURIComponent(msj)}`;

            contenedor.append(`
                <div class="col-12 col-md-6 col-lg-4 animate__animated animate__fadeIn">
                    <div class="product-card shadow-sm">
                        <div class="image-wrapper btn-zoom" data-img="${urlImagenCompleta}">
                            <span class="cat-badge">${p.categoria}</span>
                            <img src="${urlImagenCompleta}" alt="${p.nombre}">
                        </div>
                        <div class="p-4 text-center">
                            <small class="text-muted fw-bold text-uppercase">${p.marca} · ${p.genero}</small>
                            <h5 class="fw-800 my-2">${p.nombre}</h5>
                            <p class="h4 fw-800 text-primary mb-4">s/${p.precio.toFixed(2)}</p>
                            <a href="${linkWA}" target="_blank" class="btn-whatsapp">
                                <i class="fab fa-whatsapp me-2"></i> Consultar Disponibilidad
                            </a>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    $(document).on('click', '.btn-zoom', function() {
        $('#lightboxImage').attr('src', $(this).data('img'));
        $('#lightboxModal').modal('show');
    });

    $('.filter-gen').click(function() {
        $('.filter-gen').removeClass('btn-dark text-white').addClass('btn-white');
        $(this).removeClass('btn-white').addClass('btn-dark text-white');
        fGen = $(this).data('gen');
        render();
    });

    $('#select-cat, #select-marca').change(function() {
        fCat = $('#select-cat').val();
        fMarca = $('#select-marca').val();
        render();
    });

    cargarMarcas();
    render();
});
