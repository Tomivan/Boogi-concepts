import ProductDetails from '../components/product-details/product-details.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const ProductDetailsPage = () => {
    return(
        <div className='component'>
            <NavbarComponent />
            <ProductDetails />
            <Footer />
        </div>
    )
}

export default ProductDetailsPage;