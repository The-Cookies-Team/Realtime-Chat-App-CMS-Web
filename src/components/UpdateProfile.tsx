import { useEffect, useState } from "react";
import {
  MailIcon,
  CircleUserRoundIcon,
  InfoIcon,
  PhoneIcon,
  ShieldEllipsisIcon,
} from "lucide-react";
import InputField from "./InputField";
import useForm from "../hooks/useForm";
import { EmailPattern, PhonePattern } from "../types/constant";
import useFetch from "../hooks/useFetch";
import UserIcon from "../assets/user_icon.png";
import SelectField from "./SelectField";
import { getDate, uploadImage } from "../types/utils";
import DatePickerField from "./DatePickerField";
import { toast } from "react-toastify";
import ChangePassword from "./ChangePassword";
import CustomModal from "./CustomModal";

const UpdateProfile = ({ isVisible, setVisible, userId }: any) => {
  const [isChecked, setIsChecked] = useState(false);
  const [roles, setRoles] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState<any>(null);

  const validate = (form: any) => {
    const newErrors: any = {};
    if (!form.displayName.trim())
      newErrors.displayName = "Tên người dùng không được bỏ trống";
    if (!form.email.trim()) newErrors.email = "Email không được bỏ trống";
    else if (!EmailPattern.test(form.email))
      newErrors.email = "Email không hợp lệ";
    if (!form.phone) newErrors.phone = "Số điện thoại không được bỏ trống";
    else if (!PhonePattern.test(form.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (!form.roleId.trim()) newErrors.roleId = "Vai trò không được bỏ trống";
    if (isChecked) {
      if (!form.password || form.password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (form.confirmPassword !== form.password)
        newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }
    return newErrors;
  };

  const { form, errors, setForm, setErrors, handleChange, isValidForm } =
    useForm(
      {
        displayName: "",
        email: "",
        phone: "",
        birthDate: "",
        bio: "",
        avatarUrl: null,
        roleId: "",
        password: "",
        confirmPassword: "",
      },
      {},
      validate
    );

  const { get, put, post, loading } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        setErrors({});
        setAvatarPreview(null);
        setIsChecked(false);
        const userRes = await get(`/v1/user/get/${userId}`);
        const roleRes = await get(`/v1/role/list?isPaged=0`);
        setRoles(roleRes.data);
        setForm({
          ...userRes.data,
          roleId: userRes.data.role,
          password: null,
          birthDate: userRes.data.birthDate
            ? getDate(userRes.data.birthDate)
            : null,
        });
      }
    };
    fetchData();
  }, [isVisible, userId]);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (isValidForm()) {
      const updatedForm = {
        ...form,
        birthDate: form.birthDate ? `${form.birthDate} 07:00:00` : null,
        password: form.password || null,
        status: 1,
        avatarUrl: avatarPreview
          ? await uploadImage(avatarPreview, post)
          : form.avatarUrl,
      };
      const res = await put("/v1/user/update", updatedForm);
      if (res.result) {
        toast.success("Cập nhật thành công");
        setVisible(false);
        window.location.reload();
      } else {
        toast.error(res.message);
      }
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  if (!isVisible) return null;

  return (
    <CustomModal
      onClose={() => setVisible(false)}
      title="Chỉnh sửa hồ sơ"
      topComponent={
        <div className="relative w-32 h-32 rounded-full border-4 overflow-hidden">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <img
            src={avatarPreview || form.avatarUrl || UserIcon}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      }
      bodyComponent={
        <>
          <InputField
            title="Tên hiển thị"
            isRequire
            placeholder="Nhập tên hiển thị"
            value={form.displayName}
            onChangeText={(value: any) => handleChange("displayName", value)}
            icon={CircleUserRoundIcon}
            error={errors.displayName}
          />
          <InputField
            title="Tiểu sử"
            placeholder="Đôi nét về bạn"
            value={form.bio}
            onChangeText={(value: any) => handleChange("bio", value)}
            icon={InfoIcon}
          />
          <InputField
            title="Email"
            isRequire
            placeholder="Nhập địa chỉ email"
            value={form.email}
            onChangeText={(value: any) => handleChange("email", value)}
            icon={MailIcon}
            error={errors.email}
          />
          <InputField
            title="Số điện thoại"
            isRequire
            placeholder="Nhập số điện thoại"
            value={form.phone}
            onChangeText={(value: any) => handleChange("phone", value)}
            icon={PhoneIcon}
            error={errors.phone}
          />
          <DatePickerField
            title="Ngày sinh"
            value={form.birthDate}
            onChangeDate={(value: any) => handleChange("birthDate", value)}
            maxDate={new Date()}
            placeholder="Chọn ngày sinh"
          />
          <SelectField
            title="Vai trò"
            value={form.roleId}
            options={roles}
            isRequire
            onChange={(value: any) => handleChange("roleId", value)}
            icon={ShieldEllipsisIcon}
            disabled
            error={errors.roleId}
          />
          <ChangePassword
            form={form}
            errors={errors}
            handleChange={handleChange}
            isChecked={isChecked}
            setIsChecked={setIsChecked}
          />
        </>
      }
      buttonText="Lưu"
      onButtonClick={handleUpdate}
      loading={loading}
    />
  );
};

export default UpdateProfile;