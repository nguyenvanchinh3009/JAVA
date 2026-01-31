import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Show,
    SimpleShowLayout,
    ArrayField,
    ImageField,
    ReferenceField,
    useNotify,
    useRefresh,
    useRedirect,
    useRecordContext,
    Identifier,
} from 'react-admin';
import PDFButton from '../PDFButton';

/* =======================
   PDF BUTTON (LOG)
======================= */
const CustomPDFButton = () => {
    const record = useRecordContext();

    console.log('📌 CustomPDFButton record =', record);

    if (!record?.id) {
        console.warn('⚠️ CustomPDFButton: NO record.id');
        return null;
    }

    console.log('✅ CustomPDFButton render PDFButton');
    return <PDFButton />;
};

/* =======================
   CART LIST
======================= */
export const CartList = () => {
    const handleRowClick = (id?: Identifier) => {
        console.log('👉 CLICK ROW, id =', id);

        if (!id) {
            console.error('❌ NO ID');
            return false;
        }

        // LƯU CART ID
        localStorage.setItem('globalCartId', String(id));
        console.log('💾 Saved globalCartId =', id);

        // LẤY EMAIL
        const email = localStorage.getItem('username');
        console.log('📧 username from localStorage =', email);

        if (email) {
            localStorage.setItem('globalEmailCart', email);
            console.log('💾 Saved globalEmailCart =', email);
        }

        console.log('➡️ NAVIGATE TO SHOW');
        return 'show';
    };

    return (
        <List>
            <Datagrid rowClick={handleRowClick}>
                <TextField source="id" label="Cart ID" />
                <NumberField source="totalPrice" label="Total Price" />
            </Datagrid>
        </List>
    );
};

/* =======================
   CART SHOW
======================= */
export const CartShow = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();

    const email =
        localStorage.getItem('globalEmailCart') ||
        localStorage.getItem('username');

    console.log('🟢 CartShow render');
    console.log('📧 email =', email);
    console.log('🆔 cartId =', localStorage.getItem('globalCartId'));

    if (!email) {
        console.error('❌ CartShow: NO EMAIL');
        return <span>❌ Email is required</span>;
    }

    return (
        <Show
            queryOptions={{
                meta: { email },
                onError: (error: any) => {
                    console.error('🔥 SHOW ERROR', error);
                    notify(`Could not load cart: ${error.message}`, {
                        type: 'error',
                    });
                    redirect('/carts');
                    refresh();
                },
                onSuccess: (data) => {
                    console.log('✅ SHOW DATA =', data);
                },
            }}
        >
            <SimpleShowLayout>
                <CustomPDFButton />

                <TextField source="id" label="Cart ID" />
                <NumberField source="totalPrice" label="Total Price" />

                <ArrayField source="products" label="Products">
                    <Datagrid bulkActionButtons={false}>
                        <TextField source="id" label="Product ID" />
                        <TextField source="productName" label="Product Name" />
                        <ImageField source="image" label="Image" />
                        <NumberField source="quantity" label="Quantity" />
                        <NumberField source="price" label="Price" />
                        <NumberField source="discount" label="Discount" />
                        <NumberField source="specialPrice" label="Special Price" />
                        <TextField source="categoryName" label="Category Name" />
                        {/* <ReferenceField
                            source="category.id"
                            reference="categories"
                            label="Category"
                        >
                            <TextField source="name" />
                        </ReferenceField> */}
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
};
