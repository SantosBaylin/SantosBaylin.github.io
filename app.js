$(document).ready(function() {
    
    const BASE_URL = "https://santosbaylin.github.io/"; 
    const TELEFONO_VENTAS = "51924178267";
    
    let fGen = "Todos", fCat = "Todas", fMarca = "Todas", fBusqueda = "";

    function cargarMarcas() {
        const productosFiltradosPorCat = PRODUCTOS_DB.filter(p => 
            fCat === "Todas" || p.categoria === fCat
        );

        const marcas = [...new Set(
            productosFiltradosPorCat
                .map(p => p.marca)
                .filter(m => m && m !== "Sin Marca")
        )];
        
        const selectMarca = $('#select-marca');
        selectMarca.html('<option value="Todas">Todas las Marcas</option>');
        
        marcas.sort().forEach(m => {
            selectMarca.append(`<option value="${m}">${m}</option>`);
        });
    }

    function render() {
        const contenedor = $('#contenedor-tienda');
        contenedor.empty();

        const filtrados = PRODUCTOS_DB.filter(p => {
            const mGen = (fGen === "Todos" || p.genero === fGen);
            const mCat = (fCat === "Todas" || p.categoria === fCat);
            const mMarca = (fMarca === "Todas" || p.marca === fMarca);
            const mBusqueda = p.nombre.toLowerCase().includes(fBusqueda.toLowerCase()) || 
                              p.marca.toLowerCase().includes(fBusqueda.toLowerCase()) ||
                              p.id.toString().includes(fBusqueda);
            
            return mGen && mCat && mMarca && mBusqueda;
        });

        if (filtrados.length === 0) {
            contenedor.append('<div class="col-12 text-center my-5"><h5 class="text-muted">No se encontraron productos</h5></div>');
            return;
        }

        filtrados.forEach(p => {
            const urlImagenCompleta = BASE_URL + p.img;
            const tieneTallas = p.tallas && p.tallas.length > 0;
            const tallasTexto = tieneTallas ? p.tallas.join(', ') : "Única";

            // MENSAJE DE WHATSAPP
            let msj = `¡Hola! Me interesa este producto:\n\n` +
                      `🆔 *Código:* ${p.id}\n` +
                      `📌 *Modelo:* ${p.nombre}\n` +
                      `🏷️ *Marca:* ${p.marca}\n` +
                      `💰 *Precio:* s/${p.precio.toFixed(2)}\n` +
                      `👤 *Género:* ${p.genero}\n`;
            
            if (tieneTallas) msj += `📏 *Talla:* ${tallasTexto}\n`;
            msj += `\n🔗 *Ver imagen:* ${urlImagenCompleta}`;

            const linkWA = `https://api.whatsapp.com/send?phone=${TELEFONO_VENTAS}&text=${encodeURIComponent(msj)}`;

            // UI DE TALLAS (Se crean badges individuales)
            const htmlTallas = tieneTallas ? `
                <div class="mb-3">
                    <small class="text-secondary d-block mb-1">Tallas disponibles:</small>
                    <div class="d-flex flex-wrap justify-content-center gap-1">
                        ${p.tallas.map(t => `<span class="badge border text-dark bg-light">${t}</span>`).join('')}
                    </div>
                </div>` : `
                <div class="mb-3">
                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                        <i class="fas fa-check-circle me-1"></i> Stock Disponible
                    </span>
                </div>`;

            contenedor.append(`
                <div class="col-12 col-md-6 col-lg-4 animate__animated animate__fadeIn">
                    <div class="product-card shadow-sm h-100">
                        <div class="image-wrapper btn-zoom" data-img="${urlImagenCompleta}" style="cursor: pointer;">
                            <span class="cat-badge">${p.categoria}</span>
                            <img src="${urlImagenCompleta}" alt="${p.nombre}" class="img-fluid">
                        </div>
                        <div class="p-4 text-center d-flex flex-column">
                            <small class="text-muted fw-bold text-uppercase">${p.marca} · ${p.genero}</small>
                            <h5 class="fw-bold my-2">${p.nombre}</h5>
                            <p class="h4 fw-800 text-primary mb-3">s/${p.precio.toFixed(2)}</p>
                            
                            ${htmlTallas}

                            <div class="mt-auto">
                                <a href="${linkWA}" target="_blank" class="btn-whatsapp w-100">
                                    <i class="fab fa-whatsapp me-2"></i> Consultar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // EVENTOS
    $('#input-busqueda').on('input', function() {
        fBusqueda = $(this).val();
        render();
    });

    $('#select-cat').change(function() {
        fCat = $(this).val();
        fMarca = "Todas"; 
        cargarMarcas();
        render();
    });

    $('#select-marca').change(function() {
        fMarca = $(this).val();
        render();
    });

    $('.filter-gen').click(function() {
        $('.filter-gen').removeClass('btn-dark text-white').addClass('btn-white');
        $(this).removeClass('btn-white').addClass('btn-dark text-white');
        fGen = $(this).data('gen');
        render();
    });

    $(document).on('click', '.btn-zoom', function() {
        $('#lightboxImage').attr('src', $(this).data('img'));
        $('#lightboxModal').modal('show');
    });

    cargarMarcas();
    render();
});
