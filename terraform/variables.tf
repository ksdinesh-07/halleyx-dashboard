variable "aws_region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "key_name" {
  description = "AWS EC2 Key Pair name"
  default     = "halleyx-key"
}

variable "app_name" {
  default = "halleyx-dashboard"
}
