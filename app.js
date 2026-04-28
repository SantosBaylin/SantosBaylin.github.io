$(document).ready(function() {
    const BASE_URL = "https://santosbaylin.github.io/"; 
    const TELEFONO_VENTAS = "51924178267";
    let fGen = "Todos", fCat = "Todas", fMarca = "Todas", fBusqueda = "";

    let productoActivo = null;
    let colorIdxActivo = 0;
    let fotoIdxActiva = 0;

    function cargarMarcas() {
        const filtradosContexto = PRODUCTOS_DB.filter(p => {
            const mGen = (fGen === "Todos" || p.genero === fGen || p.genero === "Todos");
            const mCat = (fCat === "Todas" || p.categoria === fCat);
            return mGen && mCat;
        });
        const marcas = [...new Set(filtradosContexto.map(p => p.marca).filter(m => m))];
        const selectMarca = $('#select-marca');
        selectMarca.html('<option value="Todas">Todas las Marcas</option>');
        marcas.sort().forEach(m => selectMarca.append(`<option value="${m}">${m}</option>`));
        if (marcas.includes(fMarca)) selectMarca.val(fMarca); else fMarca = "Todas";
    }

    function render() {
        const contenedor = $('#contenedor-tienda');
        contenedor.empty();
        const filtrados = PRODUCTOS_DB.filter(p => {
            const mGen = (fGen === "Todos" || p.genero === fGen || p.genero === "Todos");
            const mCat = (fCat === "Todas" || p.categoria === fCat);
            const mMarca = (fMarca === "Todas" || p.marca === fMarca);
            const mBusqueda = p.nombre.toLowerCase().includes(fBusqueda.toLowerCase()) || p.id.toString().includes(fBusqueda);
            return mGen && mCat && mMarca && mBusqueda;
        });

        if (filtrados.length === 0) {
            contenedor.append('<div class="col-12 text-center my-5 text-muted"><h5>No se encontraron productos</h5></div>');
            return;
        }

        filtrados.forEach(p => {
            const tieneVariantes = p.variantes && p.variantes.length > 0;
            let vActiva = tieneVariantes ? p.variantes[0] : null;
            let imgRuta = vActiva ? (vActiva.imgs ? vActiva.imgs[0] : vActiva.img) : (p.imgs ? p.imgs[0] : p.img);
            const urlImg = BASE_URL + imgRuta;

            const tieneVariasFotos = (vActiva && vActiva.imgs && vActiva.imgs.length > 1) || (p.imgs && p.imgs.length > 1);
            const btnFotos = tieneVariasFotos ? `
                <button class="nav-img prev" data-dir="-1"><i class="fas fa-chevron-left"></i></button>
                <button class="nav-img next" data-dir="1"><i class="fas fa-chevron-right"></i></button>
            ` : "";

            // --- LÓGICA DE TALLAS ---
            let htmlTallas = "";
            if (p.tallas && p.tallas.length > 0) {
                htmlTallas = `<div class="d-flex justify-content-center flex-wrap gap-1 mb-2">`;
                p.tallas.forEach(t => {
                    htmlTallas += `<span class="badge-talla">${t}</span>`;
                });
                htmlTallas += `</div>`;
            }

            let htmlColores = "";
            if (tieneVariantes && p.variantes.length > 1) {
                htmlColores = `<div class="d-flex justify-content-center gap-2 mb-3 mt-2">`;
                p.variantes.forEach((v, i) => {
                    htmlColores += `<div class="color-dot ${i === 0 ? 'active' : ''}" style="background-color: ${v.hex};" data-color-index="${i}"></div>`;
                });
                htmlColores += `</div>`;
            }

            contenedor.append(`
                <div class="col-12 col-md-6 col-lg-4 animate__animated animate__fadeIn">
                    <div class="product-card shadow-sm h-100" data-id="${p.id}">
                        <div class="image-wrapper">
                            ${btnFotos}
                            <img src="${urlImg}" class="img-fluid main-img btn-zoom" data-current-img="0">
                            <span class="cat-badge">${p.categoria}</span>
                        </div>
                        <div class="p-4 text-center">
                            <small class="text-muted fw-bold">${p.marca} · ${p.genero}</small>
                            <h5 class="fw-bold my-2" style="font-size: 1.1rem;">${p.nombre}</h5>
                            
                            ${htmlTallas}
                            ${htmlColores}
                            
                            <p class="h4 fw-800 text-primary mb-3">s/${p.precio.toFixed(2)}</p>
                            <button class="btn-whatsapp border-0 btn-pedir"><i class="fab fa-whatsapp me-2"></i> Consultar</button>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // --- NAVEGACIÓN Y EVENTOS ---
    $(document).on('click', '.nav-img', function(e) {
        e.stopPropagation();
        const card = $(this).closest('.product-card');
        const p = PRODUCTOS_DB.find(prod => prod.id == card.data('id'));
        const colorIdx = card.find('.color-dot.active').data('color-index') || 0;
        const v = p.variantes ? p.variantes[colorIdx] : p;
        const listaImgs = v.imgs || p.imgs;

        if (listaImgs && listaImgs.length > 1) {
            let currentIdx = parseInt(card.find('.main-img').data('current-img'));
            currentIdx = (currentIdx + $(this).data('dir') + listaImgs.length) % listaImgs.length;
            card.find('.main-img').attr('src', BASE_URL + listaImgs[currentIdx]).data('current-img', currentIdx);
        }
    });

    $(document).on('click', '.color-dot', function() {
        const card = $(this).closest('.product-card');
        const colorIdx = $(this).data('color-index');
        const p = PRODUCTOS_DB.find(prod => prod.id == card.data('id'));
        const v = p.variantes[colorIdx];
        const imgRuta = v.imgs ? v.imgs[0] : v.img;
        card.find('.color-dot').removeClass('active');
        $(this).addClass('active');
        card.find('.main-img').fadeOut(100, function() {
            $(this).attr('src', BASE_URL + imgRuta).data('current-img', 0).fadeIn(100);
        });
    });

    $(document).on('click', '.btn-zoom', function() {
        const card = $(this).closest('.product-card');
        productoActivo = PRODUCTOS_DB.find(p => p.id == card.data('id'));
        colorIdxActivo = card.find('.color-dot.active').data('color-index') || 0;
        fotoIdxActiva = parseInt($(this).data('current-img')) || 0;
        actualizarModal();
        $('#lightboxModal').modal('show');
    });

    function actualizarModal() {
        const v = productoActivo.variantes ? productoActivo.variantes[colorIdxActivo] : productoActivo;
        const listaImgs = v.imgs || productoActivo.imgs;
        $('#lightboxImage').attr('src', BASE_URL + (listaImgs ? listaImgs[fotoIdxActiva] : (v.img || productoActivo.img)));
        $('.nav-modal').toggle(!!(listaImgs && listaImgs.length > 1));
    }

    $(document).on('click', '.nav-modal', function() {
        const dir = $(this).hasClass('next') ? 1 : -1;
        const v = productoActivo.variantes ? productoActivo.variantes[colorIdxActivo] : productoActivo;
        const listaImgs = v.imgs || productoActivo.imgs;
        fotoIdxActiva = (fotoIdxActiva + dir + listaImgs.length) % listaImgs.length;
        actualizarModal();
    });

    // --- WHATSAPP CON TALLAS ---
    $(document).on('click', '.btn-pedir', function() {
        const card = $(this).closest('.product-card');
        const p = PRODUCTOS_DB.find(prod => prod.id == card.data('id'));
        
        const colorTxt = card.find('.color-dot.active').length > 0 
            ? `🎨 *Color:* ${p.variantes[card.find('.color-dot.active').data('color-index')].color}\n` 
            : "";
        
        const tallasTxt = (p.tallas && p.tallas.length > 0) 
            ? `📏 *Tallas disp:* ${p.tallas.join(', ')}\n` 
            : "";

        let msj = `¡Hola! Me interesa:\n🆔 *Cod:* ${p.id}\n📌 *Mod:* ${p.nombre}\n${colorTxt}${tallasTxt}💰 *Precio:* s/${p.precio.toFixed(2)}\n🔗 *Imagen:* ${card.find('.main-img').attr('src')}`;
        
        window.open(`https://api.whatsapp.com/send?phone=${TELEFONO_VENTAS}&text=${encodeURIComponent(msj)}`, '_blank');
    });

    $('#select-cat').change(function() { fCat = $(this).val(); fMarca = "Todas"; cargarMarcas(); render(); });
    $('#select-marca').change(function() { fMarca = $(this).val(); render(); });
    
    $('.filter-gen').click(function() {
        $('.filter-gen').removeClass('active');
        $(this).addClass('active');
        fGen = $(this).data('gen'); cargarMarcas(); render();
    });

    cargarMarcas();
    render();
});
