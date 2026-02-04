import Cart from '../components/cart/cart.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const ShoppingCart = () => {
    return(
        <div className='component'>
            <NavbarComponent />
            <Cart />
            <ContactUs />
            <Footer />
        </div>
    )
}

export default ShoppingCart;