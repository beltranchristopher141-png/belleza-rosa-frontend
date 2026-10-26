import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Search, Heart, Sparkles, Menu, X, Plus, Minus, Trash2, ArrowUpRight, LayoutDashboard, Package, Users, ReceiptText, CheckCircle2, AlertCircle, Pencil, ChevronDown } from 'lucide-react';

const money = n => new Intl.NumberFormat('es-SV',{style:'currency',currency:'USD'}).format(Number(n||0));
const fallback = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80';
const categories = ['Todos','Rostro','Labios','Ojos','Uñas','Brochas','Cuidado de piel','Accesorios'];

export default function App(){
  const starterProducts = [
    {id:1,nombre:'Labial Velvet Rose',categoria:'Labios',descripcion:'Color intenso con acabado aterciopelado.',precio:8.50,stock:18,imagen:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80'},
    {id:2,nombre:'Paleta Nude Glow',categoria:'Ojos',descripcion:'Tonos suaves para looks de día y de noche.',precio:15.99,stock:12,imagen:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80'},
    {id:3,nombre:'Base Natural',categoria:'Rostro',descripcion:'Cobertura ligera para un acabado natural.',precio:12.75,stock:10,imagen:'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=900&q=80'},
    {id:4,nombre:'Rubor Rosado',categoria:'Rostro',descripcion:'Un toque de color fresco para tus mejillas.',precio:7.25,stock:15,imagen:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80'},
    {id:5,nombre:'Máscara de Pestañas',categoria:'Ojos',descripcion:'Define tus pestañas para una mirada especial.',precio:6.50,stock:20,imagen:'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=80'},
    {id:6,nombre:'Set de Brochas',categoria:'Brochas',descripcion:'Brochas esenciales para aplicar tu maquillaje.',precio:18.00,stock:8,imagen:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
    {id:7,nombre:'Esmalte Rosa',categoria:'Uñas',descripcion:'Color rosa brillante para completar tu estilo.',precio:3.75,stock:24,imagen:'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80'},
    {id:8,nombre:'Crema Hidratante',categoria:'Cuidado de piel',descripcion:'Un paso sencillo para cuidar tu piel.',precio:10.25,stock:14,imagen:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'}
  ];
  const readLocal = (key, fallbackValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? fallbackValue : JSON.parse(saved);
    } catch {
      return fallbackValue;
    }
  };
  const [products,setProducts]=useState(()=>readLocal('bellezaRosa_productos', starterProducts));
  const [employees,setEmployees]=useState(()=>readLocal('bellezaRosa_empleados', []));
  const [sales,setSales]=useState(()=>readLocal('bellezaRosa_ventas', []));
  const [view,setView]=useState('tienda');
  const [category,setCategory]=useState('Todos');
  const [search,setSearch]=useState('');
  const [cart,setCart]=useState(()=>readLocal('bellezaRosa_carrito', []));
  const [cartOpen,setCartOpen]=useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [notice,setNotice]=useState(null);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(null);
  const [productForm,setProductForm]=useState({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''});
  const [employeeForm,setEmployeeForm]=useState({nombre:'',turno:'Mañana'});
  const [saleClient,setSaleClient]=useState('Cliente de tienda');

  const notify=(message,type='success')=>{setNotice({message,type}); window.setTimeout(()=>setNotice(null),3500)};
  const loadAll=()=>{
    // Los datos se leen y guardan en el navegador, sin llamadas a una API.
    setLoading(false);
    notify('Datos cargados desde este dispositivo.');
  };
  useEffect(()=>{
    setLoading(false);
  },[]);
  useEffect(()=>{localStorage.setItem('bellezaRosa_productos',JSON.stringify(products));},[products]);
  useEffect(()=>{localStorage.setItem('bellezaRosa_empleados',JSON.stringify(employees));},[employees]);
  useEffect(()=>{localStorage.setItem('bellezaRosa_ventas',JSON.stringify(sales));},[sales]);
  useEffect(()=>{localStorage.setItem('bellezaRosa_carrito',JSON.stringify(cart));},[cart]);
  const visible=useMemo(()=>products.filter(p=>(category==='Todos'||p.categoria===category)&&`${p.nombre} ${p.descripcion}`.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const cartCount=cart.reduce((s,i)=>s+i.cantidad,0);
  const cartTotal=cart.reduce((s,i)=>s+Number(i.precio)*i.cantidad,0);
  const addToCart=p=>{if(p.stock<1)return notify('Este producto está agotado.','error');setCart(old=>{const found=old.find(i=>i.id===p.id);if(found){if(found.cantidad>=p.stock){notify('No hay más unidades disponibles.','error');return old;}return old.map(i=>i.id===p.id?{...i,cantidad:i.cantidad+1}:i);}return [...old,{...p,cantidad:1}];});notify(`${p.nombre} se agregó a tu carrito`);};
  const changeQty=(id,delta)=>setCart(old=>old.map(i=>i.id===id?{...i,cantidad:Math.max(1,Math.min(i.stock,i.cantidad+delta))}:i));
  const removeCart=id=>setCart(old=>old.filter(i=>i.id!==id));
  const checkout=()=>{
    if(!cart.length)return;
    const outOfStock = cart.some(item => {
      const product = products.find(p => p.id === item.id);
      return !product || product.stock < item.cantidad;
    });
    if(outOfStock){notify('No hay existencias suficientes para completar la compra.','error');return;}
    const total = cart.reduce((sum,item)=>sum+Number(item.precio)*item.cantidad,0);
    const sale = {
      id: Date.now(),
      cliente: saleClient.trim() || 'Cliente de tienda',
      articulos: cart.map(item=>`${item.nombre} x${item.cantidad}`).join(', '),
      empleado: 'Tienda online',
      total,
      fecha: new Date().toISOString()
    };
    setProducts(old=>old.map(product=>{
      const item=cart.find(i=>i.id===product.id);
      return item?{...product,stock:product.stock-item.cantidad}:product;
    }));
    setSales(old=>[sale,...old]);
    setCart([]);
    setCartOpen(false);
    notify(`Compra guardada en este dispositivo. Total: ${money(total)}`);
    setView('tienda');
  };
  const saveProduct=e=>{
    e.preventDefault();
    const payload={...productForm,precio:Number(productForm.precio),stock:Number(productForm.stock)};
    if(editing && typeof editing==='number'){
      setProducts(old=>old.map(product=>product.id===editing?{...product,...payload}:product));
    }else{
      setProducts(old=>[...old,{...payload,id:Date.now()}]);
    }
    setEditing(null);
    setProductForm({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''});
    notify('Producto guardado en este dispositivo.');
  };
  const editProduct=p=>{setEditing(p.id);setProductForm({nombre:p.nombre,categoria:p.categoria,descripcion:p.descripcion||'',precio:p.precio,stock:p.stock,imagen:p.imagen||''});window.scrollTo({top:0,behavior:'smooth'});};
  const deleteProduct=id=>{
    if(!confirm('¿Quieres retirar este producto del catálogo?'))return;
    setProducts(old=>old.filter(product=>product.id!==id));
    setCart(old=>old.filter(item=>item.id!==id));
    if(editing===id)setEditing(null);
    notify('Producto retirado de este dispositivo.');
  };
  const saveEmployee=e=>{
    e.preventDefault();
    if(editing?.type==='employee'){
      setEmployees(old=>old.map(employee=>employee.id===editing.id?{...employee,...employeeForm}:employee));
    }else{
      setEmployees(old=>[...old,{...employeeForm,id:Date.now()}]);
    }
    setEditing(null);
    setEmployeeForm({nombre:'',turno:'Mañana'});
    notify('Empleado guardado en este dispositivo.');
  };
  const deleteEmployee=id=>{
    if(!confirm('¿Eliminar este empleado?'))return;
    setEmployees(old=>old.filter(employee=>employee.id!==id));
    notify('Empleado eliminado de este dispositivo.');
  };
  const deleteSale=id=>{
    if(!confirm('¿Eliminar este registro de venta?'))return;
    setSales(old=>old.filter(sale=>sale.id!==id));
    notify('Venta eliminada de este dispositivo.');
  };
  const nav=[['tienda','Tienda',ShoppingBag],['productos','Productos',Package],['empleados','Empleados',Users],['ventas','Ventas',ReceiptText]];
  return <div className="app">
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Menú">{mobileMenu?<X/>:<Menu/>}</button>
      <button className="brand" onClick={()=>setView('tienda')}><span className="brand-mark">b.</span><span><b>BELLEZA ROSA</b><small>MAKEUP BOUTIQUE</small></span></button>
      <nav className={mobileMenu?'nav open':'nav'}>{nav.map(([key,label,Icon])=><button key={key} className={view===key?'nav-link selected':'nav-link'} onClick={()=>{setView(key);setMobileMenu(false)}}><Icon size={16}/>{label}</button>)}</nav>
      <div className="top-actions"><span className="top-note"><Sparkles size={15}/> Tu belleza, tu esencia</span><button className="cart-button" onClick={()=>setCartOpen(true)}><ShoppingBag size={18}/><span>Mi bolsa</span><b>{cartCount}</b></button></div>
    </header>
    {notice&&<div className={`toast ${notice.type}`}><span>{notice.type==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}</span>{notice.message}<button onClick={()=>setNotice(null)}><X size={16}/></button></div>}
    {view==='tienda'&&<main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><Sparkles size={15}/> BELLEZA EN CADA DETALLE</span><h1>Tu ritual de belleza,<br/><em>un momento para ti.</em></h1><p>Descubre tus nuevos favoritos: pequeños detalles que hacen brillar tu esencia.</p><button className="primary-button" onClick={()=>document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'})}>Explorar colección <ArrowUpRight size={17}/></button><div className="hero-foot"><span><b>01</b> Belleza auténtica</span><span><b>02</b> Amor propio</span></div></div>
        <div className="hero-art"><img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1300&q=90" alt="Colección de maquillaje"/><div className="floating-note"><span className="note-icon"><Heart size={18}/></span><span><b>Un toque de magia</b><small>Para tu versión favorita</small></span></div><div className="round-stamp">LOVE<br/>YOUR<br/>GLOW ✦</div></div>
      </section>
      <section className="promise-row"><div><span>✧</span><p><b>Favoritos seleccionados</b><small>Productos que inspiran</small></p></div><div><span>♡</span><p><b>Tu estilo, tus reglas</b><small>Exprésate sin límites</small></p></div><div><span>✿</span><p><b>Un regalo para ti</b><small>Disfruta tu rutina</small></p></div></section>
      <section className="catalog section-wrap" id="catalogo"><div className="section-heading"><div><span className="eyebrow">LA COLECCIÓN</span><h2>Pequeños tesoros <em>de belleza</em></h2><p>Encuentra ese producto que te hace sentir increíble.</p></div><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos..."/></label></div>
      <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'chip active':'chip'}>{c}</button>)}</div>
      {loading?<div className="empty-state">Cargando colección...</div>:visible.length===0?<div className="empty-state">No encontramos productos con esa búsqueda.</div>:<div className="product-grid">{visible.map((p,i)=><article className="product-card" key={p.id}><div className="product-photo"><img src={p.imagen||fallback} alt={p.nombre} onError={e=>e.currentTarget.src=fallback}/><span className="product-tag">{i%3===0?'FAVORITO':p.categoria.toUpperCase()}</span><button className="heart-button" aria-label="Favorito"><Heart size={17}/></button><button className="quick-add" onClick={()=>addToCart(p)} disabled={p.stock<1}>{p.stock<1?'Agotado':'＋ Añadir a la bolsa'}</button></div><div className="product-info"><small>{p.categoria}</small><h3>{p.nombre}</h3><p>{p.descripcion}</p><div className="product-bottom"><b>{money(p.precio)}</b><span>{p.stock>0?`${p.stock} disponibles`:'Agotado'}</span></div></div></article>)}</div>}
      </section>
      <section className="newsletter"><div><span className="eyebrow">UN MOMENTO PARA TI</span><h2>La belleza empieza <em>contigo.</em></h2><p>Explora, juega y encuentra los tonos que cuentan tu historia.</p></div><button className="light-button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Volver al inicio <ArrowUpRight size={16}/></button></section>
    </main>}
    {view!=='tienda'&&<main className="admin section-wrap"><div className="admin-title"><div><span className="eyebrow"><LayoutDashboard size={14}/> PANEL DE ADMINISTRACIÓN</span><h1>{view==='productos'?'Gestión de productos':view==='empleados'?'Nuestro equipo':'Historial de ventas'}</h1><p>Administra la información de Belleza Rosa desde un solo lugar.</p></div><button className="outline-button" onClick={loadAll}>Actualizar datos ↻</button></div>
      {view==='productos'&&<><form className="admin-form" onSubmit={saveProduct}><h3>{editing&&typeof editing==='number'?'Editar producto':'Agregar producto'}</h3><div className="form-grid"><label>Nombre<input required value={productForm.nombre} onChange={e=>setProductForm({...productForm,nombre:e.target.value})}/></label><label>Categoría<select value={productForm.categoria} onChange={e=>setProductForm({...productForm,categoria:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Precio ($)<input required min="0" step="0.01" type="number" value={productForm.precio} onChange={e=>setProductForm({...productForm,precio:e.target.value})}/></label><label>Existencias<input required min="0" step="1" type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})}/></label><label className="wide">Descripción<input value={productForm.descripcion} onChange={e=>setProductForm({...productForm,descripcion:e.target.value})}/></label><label className="wide">URL de imagen<input value={productForm.imagen} onChange={e=>setProductForm({...productForm,imagen:e.target.value})} placeholder="https://..."/></label></div><div className="form-actions"><button className="primary-button">{editing?'Guardar cambios':'Agregar producto'}</button>{editing&&<button type="button" className="outline-button" onClick={()=>{setEditing(null);setProductForm({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''})}}>Cancelar</button>}</div></form><div className="table-card"><h3>Catálogo de productos <span>{products.length} artículos</span></h3><div className="table-scroll"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.imagen||fallback} alt=""/><b>{p.nombre}</b></div></td><td>{p.categoria}</td><td>{money(p.precio)}</td><td>{p.stock}</td><td><button className="mini-action" onClick={()=>editProduct(p)}><Pencil size={15}/></button><button className="mini-action danger" onClick={()=>deleteProduct(p.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></>}
      {view==='empleados'&&<><form className="admin-form" onSubmit={saveEmployee}><h3>{editing?.type==='employee'?'Editar empleado':'Registrar empleado'}</h3><div className="form-grid"><label>Nombre completo<input required value={employeeForm.nombre} onChange={e=>setEmployeeForm({...employeeForm,nombre:e.target.value})}/></label><label>Turno<select value={employeeForm.turno} onChange={e=>setEmployeeForm({...employeeForm,turno:e.target.value})}>{['Mañana','Tarde','Noche','Completo'].map(t=><option key={t}>{t}</option>)}</select></label></div><div className="form-actions"><button className="primary-button">{editing?.type==='employee'?'Guardar cambios':'Agregar empleado'}</button>{editing?.type==='employee'&&<button type="button" className="outline-button" onClick={()=>{setEditing(null);setEmployeeForm({nombre:'',turno:'Mañana'})}}>Cancelar</button>}</div></form><div className="table-card"><h3>Equipo de trabajo <span>{employees.length} personas</span></h3><div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Turno</th><th>Acciones</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td>{e.nombre}</td><td><span className="status-pill">{e.turno}</span></td><td><button className="mini-action" onClick={()=>{setEditing({type:'employee',id:e.id});setEmployeeForm({nombre:e.nombre,turno:e.turno})}}><Pencil size={15}/></button><button className="mini-action danger" onClick={()=>deleteEmployee(e.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></>}
      {view==='ventas'&&<div className="table-card"><h3>Ventas recientes <span>{sales.length} registros</span></h3><div className="table-scroll"><table><thead><tr><th>#</th><th>Cliente</th><th>Artículos</th><th>Empleado</th><th>Total</th><th>Fecha</th><th></th></tr></thead><tbody>{sales.map(s=><tr key={s.id}><td>#{s.id}</td><td>{s.cliente}</td><td>{s.articulos||'—'}</td><td>{s.empleado||'Tienda online'}</td><td><b>{money(s.total)}</b></td><td>{new Date(s.fecha).toLocaleString('es-SV')}</td><td><button className="mini-action danger" onClick={()=>deleteSale(s.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>{!sales.length&&<div className="empty-state">Todavía no hay ventas. Haz una compra en la tienda para probar el sistema.</div>}</div>}
    </main>}
    <footer className="footer"><button className="brand footer-brand" onClick={()=>setView('tienda')}><span className="brand-mark">b.</span><span><b>BELLEZA ROSA</b><small>MAKEUP BOUTIQUE</small></span></button><span>Hecho con cariño para celebrar tu esencia ♡ · Datos guardados en este navegador</span><span>© 2026 Belleza Rosa</span></footer>
    {cartOpen&&<div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">TU SELECCIÓN</span><h2>Mi bolsa <span>({cartCount})</span></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)}><X/></button></div>{!cart.length?<div className="cart-empty"><span><ShoppingBag size={28}/></span><h3>Tu bolsa está esperando</h3><p>Agrega tus favoritos y vuelve aquí para confirmar tu compra.</p><button className="primary-button" onClick={()=>{setCartOpen(false);document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'})}}>Explorar productos</button></div>:<><div className="cart-lines">{cart.map(i=><div className="cart-line" key={i.id}><img src={i.imagen||fallback} alt={i.nombre}/><div className="cart-line-info"><b>{i.nombre}</b><span>{money(i.precio)}</span><div className="qty-control"><button onClick={()=>changeQty(i.id,-1)}><Minus size={13}/></button><span>{i.cantidad}</span><button onClick={()=>changeQty(i.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>removeCart(i.id)}><Trash2 size={16}/></button></div>)}</div><div className="checkout"><label>Nombre del cliente<input value={saleClient} onChange={e=>setSaleClient(e.target.value)} placeholder="Tu nombre"/></label><div className="total-row"><span>Subtotal</span><b>{money(cartTotal)}</b></div><div className="total-row muted"><span>Envío</span><span>Se coordina al entregar</span></div><div className="total-row grand"><span>Total</span><b>{money(cartTotal)}</b></div><button className="primary-button checkout-button" onClick={checkout}>Confirmar compra <ArrowUpRight size={17}/></button><small className="checkout-note">Compra de demostración escolar. No se procesan pagos reales.</small></div></>}</aside></div>}
  </div>;
}
